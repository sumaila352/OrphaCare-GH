'use client';

import Link from 'next/link';
import type { AuthUser, Donation, MyDonationSummary, PublicStats } from '@/lib/api';

function formatGhs(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusClass(status: string) {
  if (status === 'confirmed') return 'donor-status donor-status--confirmed';
  if (status === 'cancelled') return 'donor-status donor-status--cancelled';
  return 'donor-status donor-status--pending';
}

function statusLabel(status: string) {
  if (status === 'confirmed') return 'Confirmed';
  if (status === 'cancelled') return 'Cancelled';
  return 'Pending';
}

type Props = {
  user: AuthUser;
  donations: Donation[];
  summary: MyDonationSummary | null;
  publicStats: PublicStats | null;
  loading: boolean;
  successMsg?: string;
  error?: string;
};

export function DonorHubView({
  user,
  donations,
  summary,
  publicStats,
  loading,
  successMsg,
  error,
}: Props) {
  const firstName = user.fullName.split(/\s+/)[0] ?? user.fullName;
  const confirmedCount = summary?.confirmed ?? 0;
  const totalCount = summary?.total ?? 0;
  const impactPct = totalCount > 0 ? Math.round((confirmedCount / totalCount) * 100) : 0;

  return (
    <div className="donor-page">
      <section className="donor-hero">
        <div className="donor-hero-inner">
          <p className="donor-hero-eyebrow mb-0">Your giving journey</p>
          <h1 className="donor-hero-title">Thank you, {firstName}.</h1>
          <p className="donor-hero-lead mb-0">
            Every cedi and every gift you share helps shelter, educate, and care for children at OrphaCare GH.
            You are part of a community that turns compassion into real change.
          </p>
          <div className="donor-hero-actions mt-3">
            <Link className="donor-btn-give" href="/donate">
              <i className="bi bi-heart-fill" aria-hidden />
              Give again
            </Link>
            <Link className="donor-btn-ghost" href="/my/profile">
              <i className="bi bi-person" aria-hidden />
              My profile
            </Link>
          </div>
        </div>
      </section>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {loading && !summary ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="donor-kpi donor-kpi--gold">
                <div className="donor-kpi-icon">
                  <i className="bi bi-heart-fill" />
                </div>
                <div>
                  <div className="donor-kpi-label">Total gifts</div>
                  <div className="donor-kpi-value">{summary?.total ?? 0}</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="donor-kpi donor-kpi--teal">
                <div className="donor-kpi-icon">
                  <i className="bi bi-cash-coin" />
                </div>
                <div>
                  <div className="donor-kpi-label">Confirmed cash</div>
                  <div className="donor-kpi-value">
                    GHS {formatGhs(Number(summary?.confirmedAmountGhs ?? 0))}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="donor-kpi donor-kpi--coral">
                <div className="donor-kpi-icon">
                  <i className="bi bi-hourglass-split" />
                </div>
                <div>
                  <div className="donor-kpi-label">Awaiting review</div>
                  <div className="donor-kpi-value">{summary?.pending ?? 0}</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="donor-kpi donor-kpi--blue">
                <div className="donor-kpi-icon">
                  <i className="bi bi-patch-check-fill" />
                </div>
                <div>
                  <div className="donor-kpi-label">Confirmed gifts</div>
                  <div className="donor-kpi-value">{impactPct}%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-lg-5">
              <div className="donor-panel h-100">
                <div className="donor-panel-head">
                  <div>
                    <h2>Community impact</h2>
                    <p className="small text-muted mb-0">Together we are making a difference</p>
                  </div>
                </div>
                {publicStats ? (
                  <div className="donor-impact-grid donor-impact-grid--two">
                    <div className="donor-impact-stat">
                      <strong>{publicStats.childrenActive}</strong>
                      <span>Children in care</span>
                    </div>
                    <div className="donor-impact-stat">
                      <strong>{publicStats.donorsTotal}</strong>
                      <span>Generous donors</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted small mb-0">Impact stats will appear here shortly.</p>
                )}
                <p className="small text-muted mt-3 mb-0">
                  <i className="bi bi-quote me-1" aria-hidden />
                  &ldquo;It is more blessed to give than to receive.&rdquo; — Your generosity matters.
                </p>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="donor-panel h-100">
                <div className="donor-panel-head">
                  <div>
                    <h2>Why your gift matters</h2>
                    <p className="small text-muted mb-0">Where donations go at OrphaCare GH</p>
                  </div>
                </div>
                <ul className="list-unstyled mb-0 vstack gap-3">
                  <li className="d-flex gap-3">
                    <span className="donor-bullet-icon donor-bullet-icon--teal">
                      <i className="bi bi-house-heart-fill" />
                    </span>
                    <div>
                      <strong>Safe shelter &amp; daily care</strong>
                      <p className="small text-muted mb-0">Nutritious meals, clothing, and a loving home environment.</p>
                    </div>
                  </li>
                  <li className="d-flex gap-3">
                    <span className="donor-bullet-icon donor-bullet-icon--gold">
                      <i className="bi bi-book-fill" />
                    </span>
                    <div>
                      <strong>Education &amp; school support</strong>
                      <p className="small text-muted mb-0">Fees, supplies, and tutoring so every child can learn.</p>
                    </div>
                  </li>
                  <li className="d-flex gap-3">
                    <span className="donor-bullet-icon donor-bullet-icon--coral">
                      <i className="bi bi-heart-pulse-fill" />
                    </span>
                    <div>
                      <strong>Health &amp; wellbeing</strong>
                      <p className="small text-muted mb-0">Medical care and emotional support when children need it most.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="donor-panel">
            <div className="donor-panel-head">
              <div>
                <h2>Your donation history</h2>
                <p className="small text-muted mb-0">Every gift you have made to OrphaCare GH</p>
              </div>
              <Link className="donor-btn-give btn-sm py-2 px-3" href="/donate" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-plus-lg" aria-hidden /> New gift
              </Link>
            </div>

            {donations.length === 0 ? (
              <div className="donor-empty">
                <i className="bi bi-gift" aria-hidden />
                <p className="fw-semibold mb-2">Your first gift starts here</p>
                <p className="text-muted small mb-3">
                  Make a cash or in-kind donation and track its impact right from this page.
                </p>
                <Link className="donor-btn-give" href="/donate">
                  Make your first donation
                </Link>
              </div>
            ) : (
              <div className="donor-gift-list">
                {donations.map((d) => {
                  const isCash = d.type === 'cash';
                  const title = isCash
                    ? `GHS ${formatGhs(Number(d.amount ?? 0))}`
                    : (d.items ?? []).map((i) => i.itemName).join(', ') || 'In-kind gift';
                  const sub = [
                    String(d.createdAt).slice(0, 10),
                    isCash ? 'Cash donation' : 'In-kind',
                    d.reference ? `Ref: ${d.reference}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ');

                  return (
                    <div className="donor-gift-card" key={d.id}>
                      <div className={`donor-gift-icon ${isCash ? 'donor-gift-icon--cash' : 'donor-gift-icon--kind'}`}>
                        <i className={`bi ${isCash ? 'bi-cash-stack' : 'bi-box-seam'}`} aria-hidden />
                      </div>
                      <div className="donor-gift-meta">
                        <div className="donor-gift-title">{title}</div>
                        <div className="donor-gift-sub">{sub}</div>
                      </div>
                      <span className={statusClass(d.status)}>{statusLabel(d.status)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
