import { createHmac, timingSafeEqual } from 'crypto';

const PAYSTACK_BASE = 'https://api.paystack.co';
const PAYSTACK_TIMEOUT_MS = 30_000;

async function paystackFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PAYSTACK_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Paystack request timed out. Check your internet connection and try again.');
    }
    throw new Error('Could not reach Paystack. Check your internet connection and try again.');
  } finally {
    clearTimeout(timer);
  }
}

export type PaystackConfig = {
  secretKey: string;
  publicKey: string;
};

export function getPaystackConfig(): PaystackConfig | null {
  const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim() ?? '';
  const publicKey = process.env.PAYSTACK_PUBLIC_KEY?.trim() ?? '';
  if (!secretKey || !publicKey) return null;
  return { secretKey, publicKey };
}

export function isPaystackConfigured(): boolean {
  return !!getPaystackConfig();
}

function authHeaders(secretKey: string) {
  return {
    Authorization: `Bearer ${secretKey}`,
    'Content-Type': 'application/json',
  };
}

export type PaystackInitializeResult = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
};

export async function initializePaystackTransaction(input: {
  email: string;
  amountGhs: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<PaystackInitializeResult> {
  const config = getPaystackConfig();
  if (!config) throw new Error('Paystack is not configured on the server');

  const amountKobo = Math.round(input.amountGhs * 100);
  if (amountKobo < 100) throw new Error('Minimum donation is GHS 1.00');

  const res = await paystackFetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: authHeaders(config.secretKey),
    body: JSON.stringify({
      email: input.email,
      amount: amountKobo,
      currency: 'GHS',
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata ?? {},
    }),
  });

  const body = (await res.json()) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url: string; access_code: string; reference: string };
  };

  if (!res.ok || !body.status || !body.data) {
    throw new Error(body.message ?? 'Could not start Paystack payment');
  }

  return {
    authorizationUrl: body.data.authorization_url,
    accessCode: body.data.access_code,
    reference: body.data.reference,
  };
}

export type PaystackVerifyResult = {
  status: string;
  reference: string;
  amountGhs: number;
  currency: string;
  paidAt: string | null;
  channel: string | null;
};

export async function verifyPaystackTransaction(reference: string): Promise<PaystackVerifyResult> {
  const config = getPaystackConfig();
  if (!config) throw new Error('Paystack is not configured on the server');

  const res = await paystackFetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: authHeaders(config.secretKey),
  });

  const body = (await res.json()) as {
    status?: boolean;
    message?: string;
    data?: {
      status: string;
      reference: string;
      amount: number;
      currency: string;
      paid_at?: string;
      channel?: string;
    };
  };

  if (!res.ok || !body.data) {
    throw new Error(body.message ?? 'Payment verification failed');
  }

  return {
    status: body.data.status,
    reference: body.data.reference,
    amountGhs: body.data.amount / 100,
    currency: body.data.currency,
    paidAt: body.data.paid_at ?? null,
    channel: body.data.channel ?? null,
  };
}

export function verifyPaystackWebhookSignature(rawBody: Buffer, signatureHeader: string | undefined): boolean {
  const config = getPaystackConfig();
  if (!config || !signatureHeader) return false;

  const hash = createHmac('sha512', config.secretKey).update(rawBody).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

export function buildPaystackReference(donationId: number): string {
  return `ORPH-${donationId}-${Date.now()}`;
}
