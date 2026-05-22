import Link from 'next/link';
import { PublicHeader } from './PublicHeader';

export function PublicLayout({
  children,
  hero = false,
}: {
  children: React.ReactNode;
  hero?: boolean;
}) {
  return (
    <div className="public-site min-vh-100 d-flex flex-column">
      <PublicHeader hero={hero} />
      <main className="flex-grow-1">{children}</main>
      <footer className="site-footer">
        <div className="container px-3">
          <div className="row g-5 py-5">
            <div className="col-lg-4">
              <div className="footer-brand mb-3">
                <span className="brand-mark">
                  <i className="bi bi-heart-fill" />
                </span>
                OrphaCare GH
              </div>
              <p className="footer-tagline">
                Nurturing children through safe care, education, and community — with full transparency
                for every donor.
              </p>
            </div>
            <div className="col-6 col-lg-2">
              <h6 className="footer-heading">Explore</h6>
              <ul className="footer-links">
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>
                  <Link href="/about">About</Link>
                </li>
                <li>
                  <Link href="/donate">Donate</Link>
                </li>
              </ul>
            </div>
            <div className="col-6 col-lg-2">
              <h6 className="footer-heading">Account</h6>
              <ul className="footer-links">
                <li>
                  <Link href="/register">Sign up</Link>
                </li>
                <li>
                  <Link href="/login">Login</Link>
                </li>
                <li>
                  <Link href="/my/donations">My donations</Link>
                </li>
              </ul>
            </div>
            <div className="col-lg-4">
              <h6 className="footer-heading">Contact</h6>
              <p className="footer-contact mb-0">
                <i className="bi bi-envelope me-2" />
                <a href="mailto:info@orphacare.local">info@orphacare.local</a>
              </p>
              <p className="footer-contact">
                <i className="bi bi-geo-alt me-2" />
                Ghana
              </p>
            </div>
          </div>
          <div className="footer-bottom py-4">
            <span>© {new Date().getFullYear()} OrphaCare GH. All rights reserved.</span>
            <span className="footer-badge">Every gift changes a life</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
