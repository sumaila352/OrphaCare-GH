import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { toJson } from '../lib/serialize.js';
import { requireAuth, requireRole, type AuthedRequest } from '../middleware/auth.js';

export const inventoryRouter = Router();
inventoryRouter.use(requireAuth, requireRole('admin', 'staff'));

const itemSchema = z.object({
  itemName: z.string().min(1).max(140),
  category: z.enum(['food', 'clothing', 'medical', 'other']).default('other'),
  quantity: z.number().min(0).default(0),
  unit: z.string().optional().nullable(),
  lowStockThreshold: z.number().min(0).optional().nullable(),
});

const movementSchema = z.object({
  movementType: z.enum(['in', 'out', 'adjust']),
  quantity: z.number().positive(),
  reason: z.string().optional().nullable(),
});

inventoryRouter.get('/', async (req, res, next) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : '';
    const lowOnly = req.query.low === '1';

    const rows = await prisma.inventoryItem.findMany({
      where: {
        deletedAt: null,
        ...(category ? { category: category as never } : {}),
      },
      orderBy: { itemName: 'asc' },
      take: 200,
    });

    let result = rows;
    if (lowOnly) {
      result = rows.filter(
        (i) => i.lowStockThreshold !== null && i.quantity.lte(i.lowStockThreshold),
      );
    }
    return res.json(toJson(result));
  } catch (e) {
    return next(e);
  }
});

inventoryRouter.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = await prisma.inventoryItem.findFirst({
      where: { id, deletedAt: null },
      include: { movements: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
    if (!row) return res.status(404).json({ error: 'Item not found' });
    return res.json(toJson(row));
  } catch (e) {
    return next(e);
  }
});

inventoryRouter.post('/', async (req, res, next) => {
  try {
    const data = itemSchema.parse(req.body);
    const row = await prisma.inventoryItem.create({
      data: {
        itemName: data.itemName,
        category: data.category,
        quantity: data.quantity,
        unit: data.unit || null,
        lowStockThreshold: data.lowStockThreshold ?? null,
      },
    });
    return res.status(201).json(toJson(row));
  } catch (e) {
    return next(e);
  }
});

inventoryRouter.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = itemSchema.parse(req.body);
    const existing = await prisma.inventoryItem.findFirst({ where: { id, deletedAt: null } });
    if (!existing) return res.status(404).json({ error: 'Item not found' });

    const row = await prisma.inventoryItem.update({
      where: { id },
      data: {
        itemName: data.itemName,
        category: data.category,
        quantity: data.quantity,
        unit: data.unit || null,
        lowStockThreshold: data.lowStockThreshold ?? null,
      },
    });
    return res.json(toJson(row));
  } catch (e) {
    return next(e);
  }
});

inventoryRouter.post('/:id/movements', async (req: AuthedRequest, res, next) => {
  try {
    const itemId = Number(req.params.id);
    const data = movementSchema.parse(req.body);
    const userId = req.user?.sub;

    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findFirst({ where: { id: itemId, deletedAt: null } });
      if (!item) throw new Error('NOT_FOUND');

      let newQty: Prisma.Decimal;
      const qty = new Prisma.Decimal(data.quantity);
      if (data.movementType === 'in') {
        newQty = item.quantity.add(qty);
      } else if (data.movementType === 'out') {
        newQty = item.quantity.sub(qty);
        if (newQty.lt(0)) throw new Error('INSUFFICIENT');
      } else {
        newQty = qty;
      }

      const movement = await tx.stockMovement.create({
        data: {
          itemId,
          movementType: data.movementType,
          quantity: data.movementType === 'adjust' ? newQty : qty,
          reason: data.reason || null,
          createdBy: userId ?? null,
        },
      });

      const updated = await tx.inventoryItem.update({
        where: { id: itemId },
        data: { quantity: newQty },
      });

      return { movement, item: updated };
    });

    return res.status(201).json(toJson(result));
  } catch (e) {
    if (e instanceof Error && e.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Item not found' });
    }
    if (e instanceof Error && e.message === 'INSUFFICIENT') {
      return res.status(400).json({ error: 'Insufficient stock for this movement' });
    }
    return next(e);
  }
});

inventoryRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.inventoryItem.update({ where: { id }, data: { deletedAt: new Date() } });
    return res.json({ ok: true });
  } catch (e) {
    return next(e);
  }
});
