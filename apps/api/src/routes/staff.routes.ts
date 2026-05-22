import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { toJson } from '../lib/serialize.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const staffRouter = Router();
staffRouter.use(requireAuth, requireRole('admin', 'staff'));

const staffSchema = z.object({
  fullName: z.string().min(2).max(140),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
});

const attendanceSchema = z.object({
  attendDate: z.string(),
  status: z.enum(['present', 'absent', 'leave']),
});

staffRouter.get('/', async (req, res, next) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status : '';

    const rows = await prisma.staff.findMany({
      where: {
        deletedAt: null,
        ...(q ? { fullName: { contains: q } } : {}),
        ...(status ? { status: status as 'active' | 'inactive' } : {}),
      },
      orderBy: { fullName: 'asc' },
      take: 200,
    });
    return res.json(toJson(rows));
  } catch (e) {
    return next(e);
  }
});

staffRouter.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await prisma.staff.findFirst({
      where: { id, deletedAt: null },
      include: {
        attendance: { orderBy: { attendDate: 'desc' }, take: 30 },
      },
    });
    if (!row) return res.status(404).json({ error: 'Staff not found' });
    return res.json(toJson(row));
  } catch (e) {
    return next(e);
  }
});

staffRouter.post('/', async (req, res, next) => {
  try {
    const data = staffSchema.parse(req.body);
    const row = await prisma.staff.create({
      data: {
        fullName: data.fullName,
        phone: data.phone || null,
        email: data.email || null,
        position: data.position || null,
        status: data.status,
      },
    });
    return res.status(201).json(toJson(row));
  } catch (e) {
    return next(e);
  }
});

staffRouter.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = staffSchema.parse(req.body);
    const existing = await prisma.staff.findFirst({ where: { id, deletedAt: null } });
    if (!existing) return res.status(404).json({ error: 'Staff not found' });

    const row = await prisma.staff.update({
      where: { id },
      data: {
        fullName: data.fullName,
        phone: data.phone || null,
        email: data.email || null,
        position: data.position || null,
        status: data.status,
      },
    });
    return res.json(toJson(row));
  } catch (e) {
    return next(e);
  }
});

staffRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.staff.update({ where: { id }, data: { deletedAt: new Date() } });
    return res.json({ ok: true });
  } catch (e) {
    return next(e);
  }
});

staffRouter.post('/:id/attendance', async (req, res, next) => {
  try {
    const staffId = Number(req.params.id);
    const staff = await prisma.staff.findFirst({ where: { id: staffId, deletedAt: null } });
    if (!staff) return res.status(404).json({ error: 'Staff not found' });

    const data = attendanceSchema.parse(req.body);
    const attendDate = new Date(data.attendDate);
    if (Number.isNaN(attendDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    const row = await prisma.attendance.upsert({
      where: {
        staffId_attendDate: { staffId, attendDate },
      },
      create: { staffId, attendDate, status: data.status },
      update: { status: data.status },
    });
    return res.status(201).json(toJson(row));
  } catch (e) {
    return next(e);
  }
});
