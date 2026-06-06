import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { verifyPaystackWebhookSignature } from '../lib/paystack.js';
import { confirmDonationFromPaystack } from '../lib/paystackConfirm.js';

type PaystackWebhookEvent = {
  event?: string;
  data?: { reference?: string; status?: string };
};

export async function paystackWebhookHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const rawBody = req.body as Buffer;
    const signature = req.headers['x-paystack-signature'] as string | undefined;

    if (!verifyPaystackWebhookSignature(rawBody, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const payload = JSON.parse(rawBody.toString('utf8')) as PaystackWebhookEvent;
    const reference = payload.data?.reference;

    if (payload.event === 'charge.success' && reference) {
      try {
        await confirmDonationFromPaystack(reference);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'confirm failed';
        if (!msg.includes('not successful') && !msg.includes('not found')) {
          console.error('Paystack webhook confirm error:', msg);
        }
      }
    }

    if (payload.event === 'charge.failed' && reference) {
      await prisma.donation.updateMany({
        where: { reference, status: 'pending', paymentMethod: 'paystack' },
        data: { status: 'cancelled' },
      });
    }

    return res.sendStatus(200);
  } catch (e) {
    return next(e);
  }
}
