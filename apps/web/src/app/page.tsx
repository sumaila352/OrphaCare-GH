'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PublicLayout } from '@/components/PublicLayout';
import { getPublicStats, type PublicStats } from '@/lib/api';

const programs = [
  {
    accent: '#0f4c45',
    iconBg: 'rgba(15, 76, 69, 0.1)',
    icon: 'bi-house-heart-fill',
    title: 'Safe shelter',
    text: 'A stable home environment with caring staff, daily routines, and emotional support.',
  },
  {
    accent: '#e5a319',
    iconBg: 'rgba(229, 163, 25, 0.15)',
    icon: 'bi-mortarboard-fill',
    title: 'Education',
    text: 'School enrollment, learning materials, and tutoring so every child can thrive in class.',
  },
  {
    accent: '#e06352',
    iconBg: 'rgba(224, 99, 82, 0.12)',
    icon: 'bi-heart-pulse-fill',
    title: 'Health & nutrition',
    text: 'Regular checkups, balanced meals, and referrals when specialized medical care is needed.',
  },
  {
    accent: '#1a6b62',
    iconBg: 'rgba(26, 107, 98, 0.12)',
    icon: 'bi-people-fill',
    title: 'Community',
    text: 'Partners, volunteers, and local leaders working together for lasting change.',
  },
];

export default function LandingPage() {
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    getPublicStats().then(setStats).catch(() => undefined);
  }, []);

  return (
    <PublicLayout hero>
      <section className="hero">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <div className="hero-badge">
                <span className="dot" />
                Serving children across Ghana
              </div>
              <h1 className="hero-title">
                Every child deserves a future filled with <span className="highlight">hope</span>
              </h1>
              <p className="hero-lead">
                OrphaCare GH provides shelter, education, and healthcare for vulnerable children — and
                gives donors full visibility into every gift they make.
              </p>
              <div className="hero-actions">
                <Link className="btn-oc-primary btn-lg" href="/donate">
                  <i className="bi bi-gift-fill" />
                  Donate today
                </Link>
                <Link className="btn-oc-secondary btn-lg" href="/register">
                  Create free account
                </Link>
              </div>
              <div className="hero-trust">
                <span>
                  <i className="bi bi-shield-check" /> Transparent giving
                </span>
                <span>
                  <i className="bi bi-clock-history" /> Track pending → confirmed
                </span>
                <span>
                  <i className="bi bi-cash-coin" /> Cash & in-kind
                </span>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="impact-panel">
                <h3>Live impact</h3>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="stat-tile">
                      <div className="value">{stats?.childrenActive ?? '—'}</div>
                      <div className="label">Children in care</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="stat-tile">
                      <div className="value">{stats?.donorsTotal ?? '—'}</div>
                      <div className="label">Generous donors</div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="stat-tile stat-tile--wide">
                      <div className="value">
                        {stats
                          ? `GHS ${Number(stats.donationsConfirmedTotalGhs).toLocaleString()}`
                          : '—'}
                      </div>
                      <div className="label">Confirmed support received</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--white">
        <div className="container">
          <div className="row mb-5">
            <div className="col-lg-8">
              <span className="section-label">Our programs</span>
              <h2 className="section-title">Holistic care that meets real needs</h2>
              <p className="section-intro">
                We do not just house children — we invest in their whole wellbeing, from the classroom to
                the clinic to the community around them.
              </p>
            </div>
          </div>
          <div className="row g-4">
            {programs.map((p) => (
              <div className="col-md-6 col-lg-3" key={p.title}>
                <article
                  className="program-card"
                  style={
                    {
                      '--card-accent': p.accent,
                      '--icon-bg': p.iconBg,
                    } as Record<string, string>
                  }
                >
                  <div className="icon-wrap">
                    <i className={`bi ${p.icon}`} />
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-label">How it works</span>
            <h2 className="section-title">Give in three simple steps</h2>
          </div>
          <div className="row g-4">
            {[
              {
                n: '1',
                title: 'Create your account',
                text: 'Sign up free as a donor and get your personal giving dashboard.',
              },
              {
                n: '2',
                title: 'Make a gift',
                text: 'Donate cash (GHS) or in-kind items — school supplies, food, clothing, and more.',
              },
              {
                n: '3',
                title: 'See your impact',
                text: 'Follow each donation from pending review to confirmed by our team.',
              },
            ].map((s) => (
              <div className="col-md-4" key={s.n}>
                <div className="step-card">
                  <div className="step-num">{s.n}</div>
                  <h4>{s.title}</h4>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--white">
        <div className="container">
          <div className="quote-block">
            <blockquote>
              A single act of generosity can change a child&apos;s story — and with OrphaCare, you see
              exactly how your gift is received and confirmed.
            </blockquote>
            <cite>— The OrphaCare GH team</cite>
          </div>
        </div>
      </section>

      <section className="section section--cream pb-5">
        <div className="container">
          <div className="cta-panel">
            <h2>Ready to make a difference?</h2>
            <p>
              Join donors who believe every child in Ghana deserves safety, learning, and love. Your
              account is free — your impact is lasting.
            </p>
            <div className="d-flex flex-wrap gap-3 justify-content-center">
              <Link className="btn-oc-primary btn-lg" href="/register">
                Start giving
              </Link>
              <Link className="btn-oc-outline btn-lg" href="/about">
                Learn about us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
