import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { toJson } from '../lib/serialize.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth, requireRole('admin', 'staff'));

dashboardRouter.get('/stats', async (_req, res, next) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const startOfMonth = new Date(year, now.getMonth(), 1);
    const startOfYear = new Date(year, 0, 1);
    const bucketStart = new Date(year, now.getMonth() - 5, 1);

    const cashConfirmed = (from: Date) => ({
      type: 'cash' as const,
      status: 'confirmed' as const,
      createdAt: { gte: from },
    });

    const [
      totalChildren,
      donationsMonthAgg,
      donationsYtdAgg,
      pendingDonations,
      activeStaff,
      childrenByStatus,
      donationsYtdRows,
      lowStock,
    ] = await Promise.all([
      prisma.child.count({ where: { deletedAt: null } }),
      prisma.donation.aggregate({ _sum: { amount: true }, where: cashConfirmed(startOfMonth) }),
      prisma.donation.aggregate({ _sum: { amount: true }, where: cashConfirmed(startOfYear) }),
      prisma.donation.count({ where: { status: 'pending' } }),
      prisma.staff.count({ where: { deletedAt: null, status: 'active' } }),
      prisma.child.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: { id: true },
      }),
      prisma.donation.findMany({
        where: { status: 'confirmed', createdAt: { gte: startOfYear } },
        select: { amount: true, createdAt: true, type: true },
      }),
      prisma.inventoryItem.findMany({
        where: { deletedAt: null, lowStockThreshold: { not: null } },
        orderBy: { quantity: 'asc' },
        take: 8,
      }),
    ]);

    const lowStockAlerts = lowStock.filter(
      (item) => item.lowStockThreshold !== null && item.quantity.lte(item.lowStockThreshold),
    );

    const monthBuckets: { label: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, now.getMonth() - i, 1);
      monthBuckets.push({
        label: d.toLocaleString('en-GH', { month: 'short' }),
        amount: 0,
      });
    }

    let cashYtd = 0;
    let inKindYtd = 0;
    for (const row of donationsYtdRows) {
      const amt = Number(row.amount ?? 0);
      const created = row.createdAt;
      const monthIndex =
        (created.getFullYear() - bucketStart.getFullYear()) * 12 +
        (created.getMonth() - bucketStart.getMonth());
      if (monthIndex >= 0 && monthIndex < 6 && row.type === 'cash') {
        monthBuckets[monthIndex].amount += amt;
      }
      if (row.type === 'cash') cashYtd += amt;
      else inKindYtd += 1;
    }

    return res.json(
      toJson({
        totalChildren,
        donationsThisMonth: Number(donationsMonthAgg._sum.amount ?? 0),
        donationsYtd: Number(donationsYtdAgg._sum.amount ?? 0),
        pendingDonations,
        activeStaff,
        donationsByMonth: monthBuckets,
        childrenByStatus: childrenByStatus.map((r) => ({
          status: r.status,
          count: r._count.id,
        })),
        donationsBreakdown: { cashAmount: cashYtd, inKindCount: inKindYtd },
        lowStock: lowStockAlerts.map((i) => ({
          itemName: i.itemName,
          quantity: Number(i.quantity),
          lowStockThreshold: Number(i.lowStockThreshold),
        })),
      }),
    );
  } catch (e) {
    return next(e);
  }
});
