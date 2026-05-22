import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { toJson } from '../lib/serialize.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const donorsRouter = Router();
donorsRouter.use(requireAuth, requireRole('admin', 'staff'));

const donorSchema = z.object({
  fullName: z.string().min(2).max(140),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

donorsRouter.get('/', async (req, res, next) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const rows = await prisma.donor.findMany({
      where: {
        deletedAt: null,
        ...(q ? { fullName: { contains: q } } : {}),
      },
      orderBy: { fullName: 'asc' },
      take: 200,
      include: { _count: { select: { donations: true } } },
    });
    return res.json(toJson(rows));
  } catch (e) {
    return next(e);
  }
});

donorsRouter.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await prisma.donor.findFirst({
      where: { id, deletedAt: null },
      include: { donations: { orderBy: { createdAt: 'desc' }, take: 20, include: { items: true } } },
    });
    if (!row) return res.status(404).json({ error: 'Donor not found' });
    return res.json(toJson(row));
  } catch (e) {
    return next(e);
  }
});

donorsRouter.post('/', async (req, res, next) => {
  try {
    const data = donorSchema.parse(req.body);
    const row = await prisma.donor.create({
      data: {
        fullName: data.fullName,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
      },
    });
    return res.status(201).json(toJson(row));
  } catch (e) {
    return next(e);
  }
});

donorsRouter.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = donorSchema.parse(req.body);
    const existing = await prisma.donor.findFirst({ where: { id, deletedAt: null } });
    if (!existing) return res.status(404).json({ error: 'Donor not found' });

    const row = await prisma.donor.update({
      where: { id },
      data: {
        fullName: data.fullName,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
      },
    });
    return res.json(toJson(row));
  } catch (e) {
    return next(e);
  }
});

donorsRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.donor.update({ where: { id }, data: { deletedAt: new Date() } });
    return res.json({ ok: true });
  } catch (e) {
    return next(e);
  }
});
