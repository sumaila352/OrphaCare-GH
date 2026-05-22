'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { AuthUser } from '@/lib/api';

const nav = [
  { href: '/my/donations', label: 'My donations', icon: 'bi-heart' },
  { href: '/donate', label: 'Donate', icon: 'bi-gift' },
  { href: '/my/profile', label: 'Profile', icon: 'bi-person' },
];

export function DonorShell({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="donor-shell min-vh-100">
      <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
        <div className="container">
          <Link className="navbar-brand fw-bold text-primary text-truncate me-2" href="/my/donations">
            OrphaCare GH
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#donorNav"
            aria-controls="donorNav"
            aria-expanded="false"
            aria-label="Menu"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="donorNav">
            <ul className="navbar-nav me-auto py-2 py-lg-0">
              {nav.map((item) => (
                <li className="nav-item" key={item.href}>
                  <Link
                    className={`nav-link py-2 ${pathname === item.href ? 'active fw-semibold' : ''}`}
                    href={item.href}
                  >
                    <i className={`bi ${item.icon} me-2`} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="navbar-text small text-muted mb-2 mb-lg-0 d-lg-none px-2">
              Signed in as <strong>{user.fullName}</strong>
            </p>
            <div className="header-actions-mobile d-lg-flex align-items-lg-center gap-lg-2 pb-2 pb-lg-0">
              <span className="navbar-text small text-muted d-none d-lg-inline me-2">{user.fullName}</span>
              <Link className="btn btn-outline-secondary" href="/">
                Public site
              </Link>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  localStorage.removeItem('token');
                  router.push('/login');
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <div className="container app-content py-3 py-md-4">{children}</div>
    </div>
  );
}
