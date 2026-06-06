declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        ref: string;
        callback: (response: { reference: string; status: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}

let scriptPromise: Promise<void> | null = null;

export function loadPaystackInline(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Paystack runs in the browser only'));
  if (window.PaystackPop) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-paystack-inline]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Could not load Paystack')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.dataset.paystackInline = '1';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load Paystack checkout'));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export async function openPaystackCheckout(input: {
  publicKey: string;
  email: string;
  amountGhs: number;
  reference: string;
  onSuccess: (reference: string) => void | Promise<void>;
  onClose?: () => void;
}) {
  await loadPaystackInline();
  if (!window.PaystackPop) throw new Error('Paystack checkout is unavailable');

  const handler = window.PaystackPop.setup({
    key: input.publicKey,
    email: input.email,
    amount: Math.round(input.amountGhs * 100),
    currency: 'GHS',
    ref: input.reference,
    callback: (response) => {
      void input.onSuccess(response.reference);
    },
    onClose: () => input.onClose?.(),
  });

  handler.openIframe();
}
