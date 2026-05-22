import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { toJson } from '../lib/serialize.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const reportsRouter = Router();
reportsRouter.use(requireAuth, requireRole('admin', 'staff'));

reportsRouter.get('/summary', async (_req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalChildren,
      childrenByStatus,
      totalStaff,
      activeStaff,
      totalDonors,
      donationsThisMonth,
      donationsYtd,
      recentDonations,
      inventoryItems,
      attendanceToday,
    ] = await Promise.all([
      prisma.child.count({ where: { deletedAt: null } }),
      prisma.child.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: { id: true },
      }),
      prisma.staff.count({ where: { deletedAt: null } }),
      prisma.staff.count({ where: { deletedAt: null, status: 'active' } }),
      prisma.donor.count({ where: { deletedAt: null } }),
      prisma.donation.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: { type: 'cash', createdAt: { gte: startOfMonth } },
      }),
      prisma.donation.aggregate({
        _sum: { amount: true },
        where: { type: 'cash', createdAt: { gte: startOfYear } },
      }),
      prisma.donation.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { donor: { select: { fullName: true } }, items: true },
      }),
      prisma.inventoryItem.findMany({
        where: { deletedAt: null },
        orderBy: { category: 'asc' },
      }),
      prisma.attendance.count({
        where: {
          attendDate: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          },
          status: 'present',
        },
      }),
    ]);

    const lowStockAlerts = inventoryItems.filter(
      (i) => i.lowStockThreshold !== null && i.quantity.lte(i.lowStockThreshold),
    );

    const inventoryByCategory = await prisma.inventoryItem.groupBy({
      by: ['category'],
      where: { deletedAt: null },
      _sum: { quantity: true },
      _count: { id: true },
    });

    return res.json(
      toJson({
        children: {
          total: totalChildren,
          byStatus: childrenByStatus.map((r) => ({ status: r.status, count: r._count.id })),
        },
        staff: { total: totalStaff, active: activeStaff, presentToday: attendanceToday },
        donors: { total: totalDonors },
        donations: {
          thisMonth: {
            count: donationsThisMonth._count.id,
            amount: Number(donationsThisMonth._sum.amount ?? 0),
          },
          yearToDate: Number(donationsYtd._sum.amount ?? 0),
          recent: recentDonations,
        },
        inventory: {
          totalItems: inventoryItems.length,
          lowStock: lowStockAlerts.map((i) => ({
            id: i.id,
            itemName: i.itemName,
            quantity: i.quantity,
            lowStockThreshold: i.lowStockThreshold,
            category: i.category,
          })),
          byCategory: inventoryByCategory,
        },
      }),
    );
  } catch (e) {
    return next(e);
  }
});
