import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth, requireRole('admin', 'staff'));

dashboardRouter.get('/stats', async (_req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalChildren, donationsAgg, lowStock] = await Promise.all([
      prisma.child.count({ where: { deletedAt: null } }),
      prisma.donation.aggregate({
        _sum: { amount: true },
        where: {
          type: 'cash',
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.inventoryItem.findMany({
        where: {
          deletedAt: null,
          lowStockThreshold: { not: null },
        },
        orderBy: { quantity: 'asc' },
        take: 8,
      }),
    ]);

    const lowStockAlerts = lowStock.filter(
      (item) => item.lowStockThreshold !== null && item.quantity.lte(item.lowStockThreshold),
    );

    return res.json({
      totalChildren,
      donationsThisMonth: Number(donationsAgg._sum.amount ?? 0),
      lowStock: lowStockAlerts.map((i) => ({
        itemName: i.itemName,
        quantity: i.quantity,
        lowStockThreshold: i.lowStockThreshold,
      })),
    });
  } catch (e) {
    return next(e);
  }
});
