'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { getDonations, getDonors, updateDonationStatus, type Donation, type Donor } from '@/lib/api';

export default function DonationsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [tab, setTab] = useState<'donations' | 'donors'>('donations');
  const [error, setError] = useState('');

  async function load() {
    try {
      setError('');
      const [d, dn] = await Promise.all([getDonors(), getDonations()]);
      setDonors(d);
      setDonations(dn);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    }
  }

  async function setStatus(id: number, status: 'confirmed' | 'cancelled') {
    try {
      await updateDonationStatus(id, status);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AuthGuard>
      {() => (
        <>
          <div className="page-toolbar">
            <div>
              <h1 className="h3 mb-1">Donors & Donations</h1>
              <div className="text-muted">Track donors, cash gifts, and in-kind items.</div>
            </div>
            <div className="page-toolbar-actions">
              <Link className="btn btn-outline-primary" href="/donations/donors/new">
                Add donor
              </Link>
              <Link className="btn btn-primary" href="/donations/record">
                Record donation
              </Link>
            </div>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <ul className="nav nav-tabs nav-tabs-scroll mb-3">
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link ${tab === 'donations' ? 'active' : ''}`}
                onClick={() => setTab('donations')}
              >
                Donations
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link ${tab === 'donors' ? 'active' : ''}`}
                onClick={() => setTab('donors')}
              >
                Donors
              </button>
            </li>
          </ul>
          {tab === 'donations' ? (
            <div className="card">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Donor</th>
                      <th>Type</th>
                      <th>Amount / Items</th>
                      <th>Status</th>
                      <th>Reference</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((d) => (
                      <tr key={d.id}>
                        <td>{String(d.createdAt).slice(0, 10)}</td>
                        <td>{d.donor?.fullName ?? '—'}</td>
                        <td className="text-capitalize">{d.type.replace('_', ' ')}</td>
                        <td>
                          {d.type === 'cash'
                            ? `GHS ${Number(d.amount ?? 0).toFixed(2)}`
                            : (d.items ?? []).map((i) => i.itemName).join(', ') || '—'}
                        </td>
                        <td>
                          <span
                            className={`badge ${d.status === 'confirmed' ? 'bg-success' : d.status === 'cancelled' ? 'bg-secondary' : 'bg-warning text-dark'}`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td>{d.reference ?? '—'}</td>
                        <td className="text-end">
                          {d.status === 'pending' && (
                            <div className="d-flex flex-column flex-sm-row gap-1 justify-content-end">
                              <button type="button" className="btn btn-sm btn-success" onClick={() => setStatus(d.id, 'confirmed')}>
                                Confirm
                              </button>
                              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setStatus(d.id, 'cancelled')}>
                                Cancel
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {donations.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-4">
                          No donations yet. <Link href="/donations/record">Record one</Link>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Donations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donors.map((d) => (
                      <tr key={d.id}>
                        <td className="fw-medium">{d.fullName}</td>
                        <td>{d.phone ?? '—'}</td>
                        <td>{d.email ?? '—'}</td>
                        <td>{d._count?.donations ?? 0}</td>
                      </tr>
                    ))}
                    {donors.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center text-muted py-4">
                          No donors yet. <Link href="/donations/donors/new">Add donor</Link>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </AuthGuard>
  );
}
