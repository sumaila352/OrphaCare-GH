'use client';

import Link from 'next/link';
import type { DashboardStats } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  active: '#0b5ed7',
  reunified: '#20c997',
  adopted: '#6f42c1',
  transferred: '#fd7e14',
  deceased: '#6c757d',
};

function formatGhs(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) {
    return (
      <div className="dash-donut-empty text-muted small text-center py-4">
        No children records yet
      </div>
    );
  }

  let offset = 0;
  const r = 52;
  const c = 2 * Math.PI * r;

  return (
    <div className="dash-donut-wrap">
      <svg viewBox="0 0 120 120" className="dash-donut-svg">
        <circle cx="60" cy="60" r={r} fill="none" className="dash-donut-ring" strokeWidth="14" />
        {segments.map((seg) => {
          const pct = seg.value / total;
          const dash = pct * c;
          const gap = c - dash;
          const el = (
            <circle
              key={seg.label}
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="14"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 60 60)"
              strokeLinecap="round"
            />
          );
          offset += dash;
          return el;
        })}
        <text x="60" y="56" textAnchor="middle" className="dash-donut-total">
          {total}
        </text>
        <text x="60" y="72" textAnchor="middle" className="dash-donut-sub">
          total
        </text>
      </svg>
      <ul className="dash-legend list-unstyled mb-0">
        {segments.map((seg) => (
          <li key={seg.label}>
            <span className="dash-legend-dot" style={{ background: seg.color }} />
            <span className="text-capitalize">{seg.label}</span>
            <strong>{seg.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BarChart({ data }: { data: { label: string; amount: number }[] }) {
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="dash-bars">
      {data.map((d) => (
        <div className="dash-bar-col" key={d.label}>
          <div className="dash-bar-track">
            <div
              className="dash-bar-fill"
              style={{ height: `${Math.max((d.amount / max) * 100, d.amount > 0 ? 8 : 0)}%` }}
              title={`GHS ${formatGhs(d.amount)}`}
            />
          </div>
          <div className="dash-bar-label">{d.label}</div>
          <div className="dash-bar-value">{d.amount > 0 ? formatGhs(d.amount) : '—'}</div>
        </div>
      ))}
    </div>
  );
}

function InKindVolumeBar({ count }: { count: number }) {
  if (count === 0) return null;
  const pct = Math.min(100, count * 12);
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between small mb-1">
        <span>In-kind volume (YTD)</span>
        <strong>{count} gifts</strong>
      </div>
      <div className="dash-progress">
        <div className="dash-progress-bar dash-progress-bar--kind" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function DashboardView({ stats, loading }: { stats: DashboardStats | null; loading: boolean }) {
  const year = new Date().getFullYear();
  const segments =
    stats?.childrenByStatus.map((s) => ({
      label: s.status,
      value: s.count,
      color: STATUS_COLORS[s.status] ?? '#adb5bd',
    })) ?? [];

  const sixMonthTotal =
    stats?.donationsByMonth.reduce((sum, m) => sum + m.amount, 0) ?? 0;

  const monthPct =
    stats && stats.donationsYtd > 0
      ? Math.min(100, Math.round((stats.donationsThisMonth / stats.donationsYtd) * 100))
      : 0;

  return (
    <div className="dashboard-page">
      <div className="page-toolbar dashboard-header">
        <div>
          <p className="dashboard-eyebrow mb-1">OrphaCare GH · Admin</p>
          <h1 className="h3 mb-1">Dashboard</h1>
          <div className="text-muted">
            {new Date().toLocaleDateString('en-GH', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>
        <div className="page-toolbar-actions">
          <Link className="btn btn-outline-primary" href="/donations">
            <i className="bi bi-gift me-1" /> Record donation
          </Link>
          <Link className="btn btn-primary" href="/children/new">
            <i className="bi bi-person-plus me-1" /> Add child
          </Link>
        </div>
      </div>

      {loading && !stats ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="dash-kpi dash-kpi--blue">
                <div className="dash-kpi-icon">
                  <i className="bi bi-people-fill" />
                </div>
                <div>
                  <div className="dash-kpi-label">Children in care</div>
                  <div className="dash-kpi-value">{stats?.totalChildren ?? '—'}</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="dash-kpi dash-kpi--gold">
                <div className="dash-kpi-icon">
                  <i className="bi bi-calendar-month" />
                </div>
                <div>
                  <div className="dash-kpi-label">Cash · this month</div>
                  <div className="dash-kpi-value">
                    GHS {stats ? formatGhs(stats.donationsThisMonth) : '—'}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="dash-kpi dash-kpi--teal">
                <div className="dash-kpi-icon">
                  <i className="bi bi-graph-up-arrow" />
                </div>
                <div>
                  <div className="dash-kpi-label">Cash · YTD {year}</div>
                  <div className="dash-kpi-value">GHS {stats ? formatGhs(stats.donationsYtd) : '—'}</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="dash-kpi dash-kpi--amber">
                <div className="dash-kpi-icon">
                  <i className="bi bi-hourglass-split" />
                </div>
                <div>
                  <div className="dash-kpi-label">Pending donations</div>
                  <div className="dash-kpi-value">{stats?.pendingDonations ?? '—'}</div>
                  <Link href="/donations" className="dash-kpi-link small">
                    Review & confirm →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="dash-quick-nav row g-2 mb-4">
            <div className="col-6 col-md-3">
              <Link href="/children" className="dash-quick-link">
                <i className="bi bi-people" />
                <span>Children</span>
              </Link>
            </div>
            <div className="col-6 col-md-3">
              <Link href="/donations" className="dash-quick-link">
                <i className="bi bi-gift" />
                <span>Donations</span>
              </Link>
            </div>
            <div className="col-6 col-md-3">
              <Link href="/staff" className="dash-quick-link">
                <i className="bi bi-person-badge" />
                <span>Staff</span>
              </Link>
            </div>
            <div className="col-6 col-md-3">
              <Link href="/inventory" className="dash-quick-link">
                <i className="bi bi-box-seam" />
                <span>Inventory</span>
              </Link>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-lg-8">
              <div className="dash-panel dash-panel--chart h-100">
                <div className="dash-panel-head">
                  <div>
                    <h2 className="h6 mb-0">Confirmed cash gifts</h2>
                    <p className="small text-muted mb-0">Last 6 months (GHS)</p>
                  </div>
                  <div className="dash-panel-metric text-end">
                    <div className="small text-muted">6-month total</div>
                    <div className="dash-panel-metric-value">
                      GHS {stats ? formatGhs(sixMonthTotal) : '—'}
                    </div>
                  </div>
                </div>
                <BarChart data={stats?.donationsByMonth ?? []} />
              </div>
            </div>
            <div className="col-lg-4">
              <div className="dash-panel h-100">
                <div className="dash-panel-head">
                  <div>
                    <h2 className="h6 mb-0">Children by status</h2>
                    <p className="small text-muted mb-0">Current records</p>
                  </div>
                </div>
                <DonutChart segments={segments} />
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6 col-lg-4">
              <div className="dash-panel h-100">
                <div className="dash-panel-head">
                  <h2 className="h6 mb-0">YTD giving mix</h2>
                </div>
                {stats && <InKindVolumeBar count={stats.donationsBreakdown.inKindCount} />}
                <div className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>This month vs YTD cash</span>
                    <strong>{monthPct}%</strong>
                  </div>
                  <div className="dash-progress">
                    <div className="dash-progress-bar" style={{ width: `${monthPct}%` }} />
                  </div>
                </div>
                <div className="dash-stat-row">
                  <span>
                    <i className="bi bi-cash-coin text-primary me-2" />
                    Cash (confirmed)
                  </span>
                  <strong>GHS {stats ? formatGhs(stats.donationsBreakdown.cashAmount) : '—'}</strong>
                </div>
                <div className="dash-stat-row">
                  <span>
                    <i className="bi bi-box-seam text-success me-2" />
                    In-kind gifts (count)
                  </span>
                  <strong>{stats?.donationsBreakdown.inKindCount ?? '—'}</strong>
                </div>
                <div className="dash-stat-row">
                  <span>
                    <i className="bi bi-person-badge text-secondary me-2" />
                    Active staff
                  </span>
                  <strong>{stats?.activeStaff ?? '—'}</strong>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-8">
              <div className="dash-panel h-100">
                <div className="dash-panel-head">
                  <div>
                    <h2 className="h6 mb-0">Low stock alerts</h2>
                    <p className="small text-muted mb-0">Items at or below threshold</p>
                  </div>
                  <Link href="/inventory" className="btn btn-sm btn-outline-primary">
                    Inventory
                  </Link>
                </div>
                {stats?.lowStock.length ? (
                  <ul className="list-unstyled mb-0 dash-stock-list">
                    {stats.lowStock.map((i) => {
                      const pct = Math.min(100, Math.round((i.quantity / i.lowStockThreshold) * 100));
                      return (
                        <li key={i.itemName} className="dash-stock-item">
                          <div className="d-flex justify-content-between small mb-1">
                            <span className="fw-medium">{i.itemName}</span>
                            <span className="text-danger">
                              {i.quantity} / {i.lowStockThreshold}
                            </span>
                          </div>
                          <div className="dash-progress dash-progress--danger">
                            <div className="dash-progress-bar" style={{ width: `${pct}%` }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="dash-empty-state">
                    <i className="bi bi-check-circle-fill text-success fs-2" />
                    <p className="mb-0 mt-2 fw-medium">All inventory levels look good</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
