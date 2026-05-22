import { PublicLayout } from '@/components/PublicLayout';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="page-hero">
        <div className="container">
          <span className="section-label" style={{ color: 'var(--oc-gold)' }}>
            Who we are
          </span>
          <h1 className="mb-3">About OrphaCare GH</h1>
          <p className="lead mb-0">
            A Ghana-based initiative putting children first — through care, education, health, and
            accountable stewardship of every donation.
          </p>
        </div>
      </div>

      <section className="section section--white">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="content-card mb-4">
                <h2>
                  <i className="bi bi-bullseye me-2" />
                  Our mission
                </h2>
                <p className="text-muted mb-0" style={{ lineHeight: 1.75 }}>
                  We provide holistic support for vulnerable children — safe residential care,
                  quality education, healthcare, and community partnerships — while working toward
                  stable, lasting outcomes for every young person in our program.
                </p>
              </div>
              <div className="content-card mb-4">
                <h2>
                  <i className="bi bi-shield-check me-2" />
                  Transparency you can trust
                </h2>
                <p className="text-muted mb-0" style={{ lineHeight: 1.75 }}>
                  When you give through OrphaCare, your donation appears in your personal dashboard.
                  Online gifts start as <strong>pending</strong> until our staff verifies and marks them{' '}
                  <strong>confirmed</strong> — so you always know where things stand.
                </p>
              </div>
              <div className="content-card">
                <h2>
                  <i className="bi bi-geo-alt me-2" />
                  Contact
                </h2>
                <p className="text-muted mb-2">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:info@orphacare.local" className="text-decoration-none" style={{ color: 'var(--oc-teal)' }}>
                    info@orphacare.local
                  </a>
                </p>
                <p className="text-muted mb-0">
                  <strong>Location:</strong> Ghana
                </p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="content-card sticky-lg-top" style={{ top: '6rem' }}>
                <h2 className="h5">Start giving</h2>
                <p className="text-muted small mb-4">
                  Create a donor account in minutes and track every gift you make.
                </p>
                <Link className="btn-oc-primary w-100 mb-3" href="/register">
                  Sign up free
                </Link>
                <Link className="btn-oc-outline w-100 d-block text-center" href="/donate">
                  Donate now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
