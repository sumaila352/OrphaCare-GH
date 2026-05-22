'use client';

import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { getReportSummary, type ReportSummary } from '@/lib/api';

export default function ReportsPage() {
  const [data, setData] = useState<ReportSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getReportSummary()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load reports'));
  }, []);

  return (
    <AuthGuard>
      {() => (
        <>
          <div className="mb-3">
            <h1 className="h3 mb-1">Reports & Analytics</h1>
            <div className="text-muted">Summary of children, staff, donations, and inventory.</div>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          {!data ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" />
            </div>
          ) : (
            <>
              <div className="row g-3 mb-3">
                <div className="col-6 col-md-3">
                  <div className="kpi p-3">
                    <div className="text-muted small">Children</div>
                    <div className="fs-3 fw-semibold">{data.children.total}</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="kpi p-3">
                    <div className="text-muted small">Active staff</div>
                    <div className="fs-3 fw-semibold">{data.staff.active}</div>
                    <div className="small text-muted">{data.staff.presentToday} present today</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="kpi p-3">
                    <div className="text-muted small">Donors</div>
                    <div className="fs-3 fw-semibold">{data.donors.total}</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="kpi p-3">
                    <div className="text-muted small">Donations (month)</div>
                    <div className="fs-3 fw-semibold">GHS {data.donations.thisMonth.amount.toFixed(2)}</div>
                    <div className="small text-muted">{data.donations.thisMonth.count} records</div>
                  </div>
                </div>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-body">
                      <h2 className="h6">Children by status</h2>
                      <ul className="list-group list-group-flush">
                        {data.children.byStatus.map((r) => (
                          <li key={r.status} className="list-group-item d-flex justify-content-between px-0">
                            <span className="text-capitalize">{r.status}</span>
                            <span className="fw-semibold">{r.count}</span>
                          </li>
                        ))}
                        {data.children.byStatus.length === 0 && (
                          <li className="list-group-item px-0 text-muted">No data</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-body">
                      <h2 className="h6">Low stock items</h2>
                      {data.inventory.lowStock.length === 0 ? (
                        <p className="text-success mb-0">All stock levels OK.</p>
                      ) : (
                        <ul className="list-group list-group-flush">
                          {data.inventory.lowStock.map((i) => (
                            <li key={i.id} className="list-group-item d-flex justify-content-between px-0">
                              <span>{i.itemName}</span>
                              <span className="badge text-bg-danger">
                                {i.quantity} / {i.lowStockThreshold}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h2 className="h6 mb-0">Recent donations</h2>
                        <span className="text-muted small">
                          YTD cash: GHS {data.donations.yearToDate.toFixed(2)}
                        </span>
                      </div>
                      <div className="table-responsive">
                        <table className="table table-sm mb-0">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Donor</th>
                              <th>Type</th>
                              <th>Details</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.donations.recent.map((d) => (
                              <tr key={d.id}>
                                <td>{String(d.createdAt).slice(0, 10)}</td>
                                <td>{d.donor?.fullName ?? '—'}</td>
                                <td className="text-capitalize">{d.type.replace('_', ' ')}</td>
                                <td>
                                  {d.type === 'cash'
                                    ? `GHS ${Number(d.amount ?? 0).toFixed(2)}`
                                    : (d.items ?? []).map((i) => i.itemName).join(', ')}
                                </td>
                              </tr>
                            ))}
                            {data.donations.recent.length === 0 && (
                              <tr>
                                <td colSpan={4} className="text-muted">
                                  No donations recorded.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </AuthGuard>
  );
}
