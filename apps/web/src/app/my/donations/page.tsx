'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import {
  getMyDonationSummary,
  getMyDonations,
  verifyPaystackPayment,
  type Donation,
  type MyDonationSummary,
} from '@/lib/api';

function statusBadge(status: string) {
  if (status === 'confirmed') return <span className="badge bg-success">Confirmed</span>;
  if (status === 'cancelled') return <span className="badge bg-secondary">Cancelled</span>;
  return <span className="badge bg-warning text-dark">Pending</span>;
}

function MyDonationsContent() {
  const searchParams = useSearchParams();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [summary, setSummary] = useState<MyDonationSummary | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function load() {
    try {
      setError('');
      const [d, s] = await Promise.all([getMyDonations(), getMyDonationSummary()]);
      setDonations(d);
      setSummary(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const payment = searchParams.get('payment');
    const ref = searchParams.get('ref');
    if (payment !== 'success') return;

    if (!ref) {
      setSuccessMsg('Thank you! Your payment was received.');
      return;
    }

    verifyPaystackPayment(ref)
      .then(() => {
        setSuccessMsg('Thank you! Your payment was received and your donation is confirmed.');
        return load();
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Could not verify payment');
      });
  }, [searchParams]);

  return (
    <>
      <div className="page-toolbar mb-4">
        <div>
          <h1 className="h3 mb-1">My donations</h1>
          <p className="text-muted mb-0">Track every gift you have made to OrphaCare GH.</p>
        </div>
        <div className="page-toolbar-actions">
          <Link className="btn btn-primary" href="/donate">
            Make a donation
          </Link>
        </div>
      </div>
      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
          {summary && (
            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-4">
                <div className="card kpi p-3">
                  <div className="text-muted small">Total gifts</div>
                  <div className="fs-4 fw-bold">{summary.total}</div>
                </div>
              </div>
              <div className="col-12 col-sm-4">
                <div className="card kpi p-3">
                  <div className="text-muted small">Confirmed (cash)</div>
                  <div className="fs-4 fw-bold">GHS {Number(summary.confirmedAmountGhs).toFixed(2)}</div>
                </div>
              </div>
              <div className="col-12 col-sm-4">
                <div className="card kpi p-3">
                  <div className="text-muted small">Awaiting review</div>
                  <div className="fs-4 fw-bold">{summary.pending}</div>
                </div>
              </div>
            </div>
          )}
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Details</th>
                    <th>Status</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d) => (
                    <tr key={d.id}>
                      <td>{String(d.createdAt).slice(0, 10)}</td>
                      <td className="text-capitalize">{d.type.replace('_', ' ')}</td>
                      <td>
                        {d.type === 'cash'
                          ? `GHS ${Number(d.amount ?? 0).toFixed(2)}`
                          : (d.items ?? []).map((i) => i.itemName).join(', ') || '—'}
                      </td>
                      <td>{statusBadge(d.status)}</td>
                      <td>{d.reference ?? '—'}</td>
                    </tr>
                  ))}
                  {donations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4">
                        No donations yet. <Link href="/donate">Make your first gift</Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
  );
}

export default function MyDonationsPage() {
  return (
    <AuthGuard mode="donor">
      {() => (
        <Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-primary" /></div>}>
          <MyDonationsContent />
        </Suspense>
      )}
    </AuthGuard>
  );
}
