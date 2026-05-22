import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { toJson } from '../lib/serialize.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const donationsRouter = Router();
donationsRouter.use(requireAuth, requireRole('admin', 'staff'));

const donationSchema = z.object({
  donorId: z.number().int().positive().optional().nullable(),
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

donationsRouter.get('/', async (req, res, next) => {
  try {
    const type = typeof req.query.type === 'string' ? req.query.type : '';
    const rows = await prisma.donation.findMany({
      where: type ? { type: type as 'cash' | 'in_kind' } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        donor: { select: { id: true, fullName: true } },
        items: true,
      },
    });
    return res.json(toJson(rows));
  } catch (e) {
    return next(e);
  }
});

donationsRouter.post('/', async (req, res, next) => {
  try {
    const data = donationSchema.parse(req.body);
    if (data.type === 'cash' && (data.amount === null || data.amount === undefined)) {
      return res.status(400).json({ error: 'Amount is required for cash donations' });
    }
    if (data.type === 'in_kind' && (!data.items || data.items.length === 0)) {
      return res.status(400).json({ error: 'At least one item is required for in-kind donations' });
    }

    const row = await prisma.donation.create({
      data: {
        donorId: data.donorId ?? null,
        type: data.type,
        status: 'confirmed',
        amount: data.type === 'cash' ? data.amount : null,
        currency: data.currency,
        reference: data.reference || null,
        notes: data.notes || null,
        items:
          data.type === 'in_kind' && data.items
            ? { create: data.items.map((i) => ({ itemName: i.itemName, quantity: i.quantity, unit: i.unit || null })) }
            : undefined,
      },
      include: { donor: true, items: true },
    });
    return res.status(201).json(toJson(row));
  } catch (e) {
    return next(e);
  }
});

donationsRouter.patch('/:id/status', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = z.object({ status: z.enum(['pending', 'confirmed', 'cancelled']) }).parse(req.body);
    const existing = await prisma.donation.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Donation not found' });

    const row = await prisma.donation.update({
      where: { id },
      data: { status },
      include: { donor: { select: { id: true, fullName: true } }, items: true },
    });
    return res.json(toJson(row));
  } catch (e) {
    return next(e);
  }
});
