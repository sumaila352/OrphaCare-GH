import { prisma } from './prisma.js';
import { verifyPaystackTransaction } from './paystack.js';

export async function confirmDonationFromPaystack(reference: string) {
  const donation = await prisma.donation.findUnique({ where: { reference } });
  if (!donation) {
    throw new Error('Donation not found for this payment reference');
  }
  if (donation.paymentMethod !== 'paystack') {
    throw new Error('This donation is not a Paystack payment');
  }
  if (donation.status === 'confirmed') {
    return donation;
  }
  if (donation.status === 'cancelled') {
    throw new Error('This donation was cancelled');
  }

  const verified = await verifyPaystackTransaction(reference);
  if (verified.status !== 'success') {
    throw new Error('Payment was not successful');
  }

  const expected = Number(donation.amount ?? 0);
  if (Math.abs(verified.amountGhs - expected) > 0.01) {
    throw new Error('Paid amount does not match the donation record');
  }

  return prisma.donation.update({
    where: { id: donation.id },
    data: {
      status: 'confirmed',
      notes: donation.notes
        ? `${donation.notes}\nPaid via Paystack (${verified.channel ?? 'online'}).`
        : `Paid via Paystack (${verified.channel ?? 'online'}).`,
    },
    include: { items: true },
  });
}
