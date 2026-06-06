'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { PublicLayout } from '@/components/PublicLayout';
import {
  createMyDonation,
  getMe,
  getPaystackConfig,
  initializePaystackPayment,
  verifyPaystackPayment,
  type AuthUser,
  type PaystackConfig,
} from '@/lib/api';
import { homePathForUser, isStaff } from '@/lib/auth';
import { openPaystackCheckout } from '@/lib/paystack';

function DonateForm() {
  const router = useRouter();
  const [type, setType] = useState<'cash' | 'in_kind'>('cash');
  const [cashMode, setCashMode] = useState<'online' | 'manual'>('online');
  const [paystackConfig, setPaystackConfig] = useState<PaystackConfig | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([{ itemName: '', quantity: 1, unit: '' }]);

  useEffect(() => {
    getPaystackConfig()
      .then((cfg) => {
        setPaystackConfig(cfg);
        if (!cfg.enabled) setCashMode('manual');
      })
      .catch(() => setCashMode('manual'));
  }, []);

  async function payOnline(amount: number, notes: string | null) {
    const init = await initializePaystackPayment({ amount, notes });
    await openPaystackCheckout({
      publicKey: init.publicKey,
      email: init.email,
      amountGhs: init.amountGhs,
      reference: init.reference,
      onSuccess: async (reference) => {
        try {
          await verifyPaystackPayment(reference);
          router.push(`/my/donations?payment=success&ref=${encodeURIComponent(reference)}`);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Payment verification failed');
          setLoading(false);
        }
      },
      onClose: () => setLoading(false),
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      if (type === 'cash' && cashMode === 'online') {
        const amount = Number(fd.get('amount'));
        if (!amount || amount < 1) throw new Error('Minimum online donation is GHS 1.00');
        const notes = (fd.get('notes') as string) || null;
        await payOnline(amount, notes);
        return;
      }

      const payload: Record<string, unknown> = {
        type,
        reference: fd.get('reference') || null,
        notes: fd.get('notes') || null,
        currency: 'GHS',
      };
      if (type === 'cash') {
        payload.amount = Number(fd.get('amount'));
      } else {
        const list = items.filter((i) => i.itemName.trim());
        if (list.length === 0) throw new Error('Add at least one item');
        payload.items = list.map((i) => ({
          itemName: i.itemName,
          quantity: Number(i.quantity) || 1,
          unit: i.unit || null,
        }));
      }
      await createMyDonation(payload);
      router.push('/my/donations');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit');
      setLoading(false);
    }
  }

  const paystackEnabled = paystackConfig?.enabled ?? false;

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h1 className="h4 mb-2">Make a donation</h1>
        <p className="text-muted small mb-4">
          {type === 'cash' && cashMode === 'online'
            ? 'Pay securely with card or Mobile Money via Paystack. Your gift is confirmed automatically after payment.'
            : (
              <>
                Your gift will appear as <span className="badge bg-warning text-dark">pending</span> until our team confirms it.
              </>
            )}
        </p>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={onSubmit} className="row g-3">
          <div className="col-12">
            <label className="form-label">Type</label>
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value as 'cash' | 'in_kind')}>
              <option value="cash">Cash (GHS)</option>
              <option value="in_kind">In-kind items</option>
            </select>
          </div>
          {type === 'cash' && (
            <div className="col-12">
              <label className="form-label">How will you pay?</label>
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`btn ${cashMode === 'online' ? 'btn-primary' : 'btn-outline-primary'}`}
                  disabled={!paystackEnabled}
                  onClick={() => setCashMode('online')}
                >
                  <i className="bi bi-credit-card me-1" />
                  Pay online (card / MoMo)
                </button>
                <button
                  type="button"
                  className={`btn ${cashMode === 'manual' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setCashMode('manual')}
                >
                  <i className="bi bi-bank me-1" />
                  Bank / MoMo transfer
                </button>
              </div>
              {!paystackEnabled && (
                <div className="form-text">
                  Online payments are not configured yet. Use bank transfer and include your payment reference below.
                </div>
              )}
            </div>
          )}
          {type === 'cash' ? (
            <div className="col-md-6">
              <label className="form-label">Amount (GHS) *</label>
              <input
                className="form-control"
                type="number"
                name="amount"
                min={cashMode === 'online' ? '1' : '0.01'}
                step="0.01"
                required
              />
            </div>
          ) : (
            <div className="col-12">
              <label className="form-label">Items *</label>
              {items.map((row, idx) => (
                <div className="row g-2 mb-2" key={idx}>
                  <div className="col-md-5">
                    <input
                      className="form-control"
                      placeholder="Item name"
                      value={row.itemName}
                      onChange={(e) => {
                        const next = [...items];
                        next[idx] = { ...next[idx], itemName: e.target.value };
                        setItems(next);
                      }}
                      required={idx === 0}
                    />
                  </div>
                  <div className="col-md-3">
                    <input
                      className="form-control"
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={row.quantity}
                      onChange={(e) => {
                        const next = [...items];
                        next[idx] = { ...next[idx], quantity: Number(e.target.value) };
                        setItems(next);
                      }}
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      className="form-control"
                      placeholder="Unit (bags, boxes)"
                      value={row.unit}
                      onChange={(e) => {
                        const next = [...items];
                        next[idx] = { ...next[idx], unit: e.target.value };
                        setItems(next);
                      }}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setItems([...items, { itemName: '', quantity: 1, unit: '' }])}
              >
                + Add item
              </button>
            </div>
          )}
          {type === 'cash' && cashMode === 'manual' && (
            <div className="col-md-6">
              <label className="form-label">Payment reference</label>
              <input className="form-control" name="reference" placeholder="MoMo ref, receipt #" />
            </div>
          )}
          <div className="col-12">
            <label className="form-label">Message (optional)</label>
            <textarea className="form-control" name="notes" rows={2} />
          </div>
          <div className="col-12">
            <button className="btn-oc-primary border-0" type="submit" disabled={loading}>
              {loading
                ? 'Processing…'
                : type === 'cash' && cashMode === 'online'
                  ? 'Continue to payment'
                  : 'Submit donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DonatePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }
    getMe()
      .then((u) => {
        if (isStaff(u)) {
          router.replace('/donations/record');
          return;
        }
        setUser(u);
      })
      .catch(() => setUser(null));
  }, [router]);

  if (user === undefined) {
    return (
      <PublicLayout>
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" />
        </div>
      </PublicLayout>
    );
  }

  if (!user) {
    return (
      <PublicLayout>
        <div className="container py-5">
          <div className="card auth-card mx-auto p-4 p-lg-5 text-center" style={{ maxWidth: 520 }}>
            <i className="bi bi-gift fs-1 text-primary mb-3 d-block" />
            <h1 className="h3 fw-bold mb-3">Donate to OrphaCare GH</h1>
            <p className="text-muted mb-4">
              To donate online and track your gifts, please create a free donor account or log in.
            </p>
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              <Link className="btn-oc-primary btn-lg" href="/register">
                Sign up to donate
              </Link>
              <Link className="btn-oc-outline btn-lg" href="/login?next=/donate">
                Login
              </Link>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!user.roles.includes('donor')) {
    router.replace(homePathForUser(user));
    return null;
  }

  return (
    <AuthGuard mode="donor">
      {() => <DonateForm />}
    </AuthGuard>
  );
}
