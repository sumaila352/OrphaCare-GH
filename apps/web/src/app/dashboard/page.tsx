'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { getDashboardStats } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<{
    totalChildren: number;
    donationsThisMonth: number;
    lowStock: { itemName: string; quantity: string; lowStockThreshold: string }[];
  } | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch(console.error);
  }, []);

  return (
    <AuthGuard>
      {() => (
        <>
          <div className="page-toolbar">
            <div>
              <h1 className="h3 mb-1">Dashboard</h1>
              <div className="text-muted">Overview of children, donations, and inventory.</div>
            </div>
            <div className="page-toolbar-actions">
              <Link className="btn btn-outline-primary" href="/donations">
                Record donation
              </Link>
              <Link className="btn btn-primary" href="/children/new">
                Add child
              </Link>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12 col-md-4">
              <div className="kpi p-3">
                <div className="text-muted">Total children</div>
                <div className="display-6 fw-semibold">{stats?.totalChildren ?? '—'}</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="kpi p-3">
                <div className="text-muted">Donations (this month)</div>
                <div className="display-6 fw-semibold">
                  GHS {stats ? stats.donationsThisMonth.toFixed(2) : '—'}
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="kpi p-3">
                <div className="text-muted">Low stock alerts</div>
                {stats?.lowStock?.length ? (
                  <ul className="list-unstyled mb-0 mt-2 small">
                    {stats.lowStock.map((i) => (
                      <li key={i.itemName} className="d-flex justify-content-between">
                        <span>{i.itemName}</span>
                        <span className="badge text-bg-danger">{i.quantity}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-success fw-medium mt-2">All good</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </AuthGuard>
  );
}
