import type { CSSProperties } from 'react';
import { PublicLayout } from '@/components/PublicLayout';
import Link from 'next/link';

const pillars = [
  {
    icon: 'bi-bullseye',
    accent: '#0f4c45',
    iconBg: 'rgba(15, 76, 69, 0.1)',
    title: 'Our mission',
    text: 'We provide holistic support for vulnerable children — safe residential care, quality education, healthcare, and community partnerships — while working toward stable, lasting outcomes for every young person in our program.',
  },
  {
    icon: 'bi-shield-check',
    accent: '#e5a319',
    iconBg: 'rgba(229, 163, 25, 0.15)',
    title: 'Transparency you can trust',
    text: 'When you give through OrphaCare, your donation appears in your personal dashboard. Online gifts start as pending until our staff verifies and marks them confirmed — so you always know where things stand.',
  },
  {
    icon: 'bi-heart-fill',
    accent: '#e06352',
    iconBg: 'rgba(224, 99, 82, 0.12)',
    title: 'How we care',
    text: 'Every child receives structured daily care, access to learning, and health support. We partner with donors and communities who share our commitment to dignity and long-term wellbeing.',
  },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="about-page">
        <div className="page-hero">
          <div className="container px-3">
            <span className="section-label page-hero-label">Who we are</span>
            <h1 className="mb-3">About OrphaCare GH</h1>
            <p className="lead mb-0">
              A Ghana-based initiative putting children first — through care, education, health, and
              accountable stewardship of every donation.
            </p>
          </div>
        </div>

        <section className="section section--cream about-intro">
          <div className="container px-3">
            <div className="about-page-header text-center mx-auto">
              <span className="section-label">Our story</span>
              <h2 className="section-title mb-3">Built on care, powered by trust</h2>
              <p className="section-intro mx-auto mb-0">
                OrphaCare GH connects compassionate donors with children who need stable homes,
                schooling, and health support — with clear records every step of the way.
              </p>
            </div>

            <div className="row g-4 g-lg-4 mt-2 mt-lg-4">
              {pillars.map((item) => (
                <div className="col-md-6 col-lg-4" key={item.title}>
                  <article
                    className="about-pillar h-100"
                    style={
                      {
                        '--card-accent': item.accent,
                        '--icon-bg': item.iconBg,
                      } as CSSProperties
                    }
                  >
                    <div className="about-pillar-icon">
                      <i className={`bi ${item.icon}`} aria-hidden />
                    </div>
                    <h3 className="about-pillar-title">{item.title}</h3>
                    <p className="about-pillar-text mb-0">{item.text}</p>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--white about-bottom">
          <div className="container px-3">
            <div className="row g-4 align-items-stretch">
              <div className="col-lg-7 col-xl-8">
                <div className="content-card about-contact-card h-100">
                  <h2>
                    <i className="bi bi-geo-alt me-2" aria-hidden />
                    Contact & location
                  </h2>
                  <ul className="about-contact-list list-unstyled mb-0">
                    <li>
                      <span className="about-contact-label">Email</span>
                      <a href="mailto:info@orphacare.local" className="about-link">
                        info@orphacare.local
                      </a>
                    </li>
                    <li>
                      <span className="about-contact-label">Country</span>
                      <span className="about-contact-value">Ghana</span>
                    </li>
                    <li>
                      <span className="about-contact-label">Office hours</span>
                      <span className="about-contact-value">Mon – Fri, 9:00 – 17:00 GMT</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-5 col-xl-4">
                <div className="content-card about-cta-card h-100 d-flex flex-column">
                  <span className="about-cta-eyebrow">Get involved</span>
                  <h2 className="h4 mb-2">Start giving today</h2>
                  <p className="about-cta-text mb-4">
                    Create a free donor account in minutes and track every gift — from pending to
                    confirmed.
                  </p>
                  <div className="mt-auto d-grid gap-2">
                    <Link className="btn-oc-primary w-100" href="/register">
                      Sign up free
                    </Link>
                    <Link className="btn-oc-outline w-100 text-center" href="/donate">
                      Donate now
                    </Link>
                    <Link className="btn-oc-ghost w-100 text-center" href="/">
                      ← Back to home
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
