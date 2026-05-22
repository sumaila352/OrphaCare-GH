import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { filterByName, nameSearch } from '../lib/search.js';
import { toJson } from '../lib/serialize.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const childrenRouter = Router();
childrenRouter.use(requireAuth, requireRole('admin', 'staff'));

const childSchema = z.object({
  fullName: z.string().min(2).max(140),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(['male', 'female', 'other']).optional().nullable(),
  admissionDate: z.string().optional().nullable(),
  status: z.enum(['active', 'reunified', 'adopted', 'transferred', 'deceased']).default('active'),
  notes: z.string().optional().nullable(),
});

function parseDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

childrenRouter.get('/', async (req, res, next) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status : '';

    const isSqlite = (process.env.DATABASE_URL ?? '').startsWith('file:');
    let children = await prisma.child.findMany({
      where: {
        deletedAt: null,
        ...(q && !isSqlite ? nameSearch('fullName', q) : {}),
        ...(status ? { status: status as never } : {}),
      },
      orderBy: { fullName: 'asc' },
      take: q ? 500 : 200,
    });
    if (q && isSqlite) {
      children = filterByName(children, q).slice(0, 200);
    } else if (q) {
      children = children.slice(0, 200);
    }

    return res.json(toJson(children));
  } catch (e) {
    return next(e);
  }
});

childrenRouter.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const child = await prisma.child.findFirst({ where: { id, deletedAt: null } });
    if (!child) return res.status(404).json({ error: 'Child not found' });
    return res.json(toJson(child));
  } catch (e) {
    return next(e);
  }
});

childrenRouter.post('/', async (req, res, next) => {
  try {
    const data = childSchema.parse(req.body);
    const child = await prisma.child.create({
      data: {
        fullName: data.fullName,
        dateOfBirth: parseDate(data.dateOfBirth),
        gender: data.gender ?? null,
        admissionDate: parseDate(data.admissionDate),
        status: data.status,
        notes: data.notes ?? null,
      },
    });
    return res.status(201).json(toJson(child));
  } catch (e) {
    return next(e);
  }
});

childrenRouter.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = childSchema.parse(req.body);
    const existing = await prisma.child.findFirst({ where: { id, deletedAt: null } });
    if (!existing) return res.status(404).json({ error: 'Child not found' });

    const child = await prisma.child.update({
      where: { id },
      data: {
        fullName: data.fullName,
        dateOfBirth: parseDate(data.dateOfBirth),
        gender: data.gender ?? null,
        admissionDate: parseDate(data.admissionDate),
        status: data.status,
        notes: data.notes ?? null,
      },
    });
    return res.json(toJson(child));
  } catch (e) {
    return next(e);
  }
});

childrenRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.child.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return res.json({ ok: true });
  } catch (e) {
    return next(e);
  }
});
