'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { createDonation, getDonors, type Donor } from '@/lib/api';

export default function RecordDonationPage() {
  const router = useRouter();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [type, setType] = useState<'cash' | 'in_kind'>('cash');
  const [error, setError] = useState('');

  useEffect(() => {
    getDonors().then(setDonors).catch(() => undefined);
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    const donorId = fd.get('donorId');
    try {
      const payload: Record<string, unknown> = {
        type,
        donorId: donorId ? Number(donorId) : null,
        reference: fd.get('reference') || null,
        notes: fd.get('notes') || null,
        currency: 'GHS',
      };
      if (type === 'cash') {
        payload.amount = Number(fd.get('amount'));
      } else {
        payload.items = [
          {
            itemName: String(fd.get('itemName')),
            quantity: Number(fd.get('quantity') || 1),
            unit: fd.get('unit') || null,
          },
        ];
      }
      await createDonation(payload);
      router.push('/donations');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    }
  }

  return (
    <AuthGuard>
      {() => (
        <div className="card">
          <div className="card-body p-4">
            <Link href="/donations" className="small">
              ← Back
            </Link>
            <h1 className="h4 mt-2">Record donation</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={onSubmit} className="row g-3 mt-2">
              <div className="col-12">
                <label className="form-label">Type</label>
                <select className="form-select" value={type} onChange={(e) => setType(e.target.value as 'cash' | 'in_kind')}>
                  <option value="cash">Cash</option>
                  <option value="in_kind">In-kind</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Donor (optional)</label>
                <select className="form-select" name="donorId" defaultValue="">
                  <option value="">— Anonymous / none —</option>
                  {donors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName}
                    </option>
                  ))}
                </select>
              </div>
              {type === 'cash' ? (
                <div className="col-md-6">
                  <label className="form-label">Amount (GHS) *</label>
                  <input className="form-control" type="number" name="amount" min="0.01" step="0.01" required />
                </div>
              ) : (
                <>
                  <div className="col-md-6">
                    <label className="form-label">Item name *</label>
                    <input className="form-control" name="itemName" required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Quantity</label>
                    <input className="form-control" type="number" name="quantity" min="1" defaultValue="1" />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Unit</label>
                    <input className="form-control" name="unit" placeholder="bags, boxes" />
                  </div>
                </>
              )}
              <div className="col-md-6">
                <label className="form-label">Reference</label>
                <input className="form-control" name="reference" placeholder="Receipt #, mobile money ref" />
              </div>
              <div className="col-12">
                <label className="form-label">Notes</label>
                <textarea className="form-control" name="notes" rows={2} />
              </div>
              <div className="col-12">
                <button className="btn btn-primary" type="submit">
                  Save donation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
