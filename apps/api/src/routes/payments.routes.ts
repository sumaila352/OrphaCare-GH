import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { ensureDonorForUser, getDonorForUser } from '../lib/donor.js';
import { toJson } from '../lib/serialize.js';
import type { AuthedRequest } from '../middleware/auth.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  buildPaystackReference,
  getPaystackConfig,
  initializePaystackTransaction,
  isPaystackConfigured,
} from '../lib/paystack.js';
import { confirmDonationFromPaystack } from '../lib/paystackConfirm.js';

export const paymentsRouter = Router();
paymentsRouter.use(requireAuth, requireRole('donor'));

paymentsRouter.post('/initialize', async (req: AuthedRequest, res, next) => {
  try {
    if (!isPaystackConfigured()) {
      return res.status(503).json({ error: 'Online payments are not configured yet' });
    }

    const { amount, notes } = z
      .object({
        amount: z.number().positive().max(1_000_000),
        notes: z.string().max(500).optional().nullable(),
      })
      .parse(req.body);

    if (amount < 1) {
      return res.status(400).json({ error: 'Minimum online donation is GHS 1.00' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const donor = await ensureDonorForUser(user.id, user.fullName, user.email);
    const clientUrl = (process.env.CLIENT_URL ?? 'http://localhost:3000').split(',')[0]!.trim();

    const donation = await prisma.donation.create({
      data: {
        donorId: donor.id,
        type: 'cash',
        status: 'pending',
        paymentMethod: 'paystack',
        amount,
        currency: 'GHS',
        notes: notes?.trim() || null,
      },
    });

    const reference = buildPaystackReference(donation.id);

    try {
      const paystack = await initializePaystackTransaction({
        email: user.email,
        amountGhs: amount,
        reference,
        callbackUrl: `${clientUrl}/my/donations?payment=success&ref=${encodeURIComponent(reference)}`,
        metadata: {
          donation_id: donation.id,
          donor_id: donor.id,
          user_id: user.id,
        },
      });

      const updated = await prisma.donation.update({
        where: { id: donation.id },
        data: { reference: paystack.reference },
        include: { items: true },
      });

      const config = getPaystackConfig()!;

      return res.json(
        toJson({
          donation: updated,
          publicKey: config.publicKey,
          email: user.email,
          amountGhs: amount,
          reference: paystack.reference,
          authorizationUrl: paystack.authorizationUrl,
          accessCode: paystack.accessCode,
        }),
      );
    } catch (err) {
      await prisma.donation.update({
        where: { id: donation.id },
        data: { status: 'cancelled' },
      });
      throw err;
    }
  } catch (e) {
    return next(e);
  }
});

paymentsRouter.post('/verify', async (req: AuthedRequest, res, next) => {
  try {
    const { reference } = z.object({ reference: z.string().min(8) }).parse(req.body);

    const donation = await prisma.donation.findUnique({
      where: { reference },
      include: { donor: true },
    });
    if (!donation) return res.status(404).json({ error: 'Donation not found' });

    const donor = await getDonorForUser(req.user!.sub);
    if (!donor || donation.donorId !== donor.id) {
      return res.status(403).json({ error: 'Not allowed to verify this payment' });
    }

    const confirmed = await confirmDonationFromPaystack(reference);
    return res.json(toJson({ donation: confirmed, status: 'confirmed' }));
  } catch (e) {
    return next(e);
  }
});
