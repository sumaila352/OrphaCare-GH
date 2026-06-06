import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { toJson } from '../lib/serialize.js';
import { getPaystackConfig, isPaystackConfigured } from '../lib/paystack.js';

export const publicRouter = Router();

publicRouter.get('/paystack-config', (_req, res) => {
  const config = getPaystackConfig();
  return res.json({
    enabled: isPaystackConfigured(),
    publicKey: config?.publicKey ?? null,
  });
});

publicRouter.get('/stats', async (_req, res, next) => {
  try {
    const [childrenActive, donorsTotal, donationsConfirmed, donationsPending] = await Promise.all([
      prisma.child.count({ where: { status: 'active', deletedAt: null } }),
      prisma.donor.count({ where: { deletedAt: null } }),
      prisma.donation.aggregate({
        where: { status: 'confirmed' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.donation.count({ where: { status: 'pending' } }),
    ]);

    return res.json(
      toJson({
        childrenActive,
        donorsTotal,
        donationsConfirmedCount: donationsConfirmed._count,
        donationsConfirmedTotalGhs: Number(donationsConfirmed._sum.amount ?? 0),
        donationsPendingCount: donationsPending,
      }),
    );
  } catch (e) {
    return next(e);
  }
});
