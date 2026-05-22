import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { ensureDonorForUser, getDonorForUser } from '../lib/donor.js';
import { toJson } from '../lib/serialize.js';
import type { AuthedRequest } from '../middleware/auth.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const meRouter = Router();
meRouter.use(requireAuth, requireRole('donor'));

const donorPatchSchema = z.object({
  phone: z.string().max(40).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
});

const donationSchema = z.object({
  type: z.enum(['cash', 'in_kind']),
  amount: z.number().positive().optional().nullable(),
  currency: z.string().length(3).default('GHS'),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        itemName: z.string().min(1).max(140),
        quantity: z.number().positive().default(1),
        unit: z.string().optional().nullable(),
      }),
    )
    .optional(),
});

meRouter.get('/donor', async (req: AuthedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const donor = await ensureDonorForUser(user.id, user.fullName, user.email);
    return res.json(toJson(donor));
  } catch (e) {
    return next(e);
  }
});

meRouter.patch('/donor', async (req: AuthedRequest, res, next) => {
  try {
    const data = donorPatchSchema.parse(req.body);
    const donor = await getDonorForUser(req.user!.sub);
    if (!donor) return res.status(404).json({ error: 'Donor profile not found' });

    const row = await prisma.donor.update({
      where: { id: donor.id },
      data: {
        phone: data.phone ?? donor.phone,
        address: data.address ?? donor.address,
        updatedAt: new Date(),
      },
    });
    return res.json(toJson(row));
  } catch (e) {
    return next(e);
  }
});

meRouter.get('/donations', async (req: AuthedRequest, res, next) => {
  try {
    const donor = await getDonorForUser(req.user!.sub);
    if (!donor) return res.json([]);

    const rows = await prisma.donation.findMany({
      where: { donorId: donor.id },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
    return res.json(toJson(rows));
  } catch (e) {
    return next(e);
  }
});

meRouter.get('/donations/summary', async (req: AuthedRequest, res, next) => {
  try {
    const donor = await getDonorForUser(req.user!.sub);
    if (!donor) {
      return res.json({ total: 0, confirmed: 0, pending: 0, confirmedAmountGhs: 0 });
    }

    const [all, confirmed, pending, sum] = await Promise.all([
      prisma.donation.count({ where: { donorId: donor.id } }),
      prisma.donation.count({ where: { donorId: donor.id, status: 'confirmed' } }),
      prisma.donation.count({ where: { donorId: donor.id, status: 'pending' } }),
      prisma.donation.aggregate({
        where: { donorId: donor.id, status: 'confirmed', type: 'cash' },
        _sum: { amount: true },
      }),
    ]);

    return res.json(
      toJson({
        total: all,
        confirmed,
        pending,
        confirmedAmountGhs: Number(sum._sum.amount ?? 0),
      }),
    );
  } catch (e) {
    return next(e);
  }
});

meRouter.post('/donations', async (req: AuthedRequest, res, next) => {
  try {
    const data = donationSchema.parse(req.body);
    if (data.type === 'cash' && (data.amount === null || data.amount === undefined)) {
      return res.status(400).json({ error: 'Amount is required for cash donations' });
    }
    if (data.type === 'in_kind' && (!data.items || data.items.length === 0)) {
      return res.status(400).json({ error: 'At least one item is required for in-kind donations' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const donor = await ensureDonorForUser(user.id, user.fullName, user.email);

    const row = await prisma.donation.create({
      data: {
        donorId: donor.id,
        type: data.type,
        status: 'pending',
        amount: data.type === 'cash' ? data.amount : null,
        currency: data.currency,
        reference: data.reference || null,
        notes: data.notes || null,
        items:
          data.type === 'in_kind' && data.items
            ? { create: data.items.map((i) => ({ itemName: i.itemName, quantity: i.quantity, unit: i.unit || null })) }
            : undefined,
      },
      include: { items: true },
    });
    return res.status(201).json(toJson(row));
  } catch (e) {
    return next(e);
  }
});
