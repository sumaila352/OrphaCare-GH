'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { AuthUser } from '@/lib/api';
import { ThemeToggle } from './ThemeToggle';

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
      <nav className="navbar navbar-expand-lg border-bottom sticky-top">
        <div className="container px-3">
          <div className="d-flex align-items-center w-100 gap-2">
            <Link
              className="navbar-brand fw-bold text-truncate mb-0 me-0"
              style={{ color: 'var(--oc-primary)' }}
              href="/my/donations"
            >
              OrphaCare GH
            </Link>
            <div className="navbar-mobile-tools d-flex d-lg-none align-items-center gap-2 ms-auto flex-shrink-0">
              <ThemeToggle size="sm" />
              <button
                className="navbar-toggler navbar-toggler-oc"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#donorNav"
                aria-controls="donorNav"
                aria-expanded="false"
                aria-label="Open menu"
              >
                <span className="navbar-toggler-icon" />
              </button>
            </div>
          </div>

          <div className="collapse navbar-collapse" id="donorNav">
            <ul className="navbar-nav me-auto py-2 py-lg-0">
              {nav.map((item) => (
                <li className="nav-item" key={item.href}>
                  <Link
                    className={`nav-link nav-link-with-icon py-2 ${pathname === item.href ? 'active fw-semibold' : ''}`}
                    href={item.href}
                  >
                    <i className={`bi ${item.icon} nav-link-icon`} aria-hidden />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="navbar-text small mb-2 mb-lg-0 d-lg-none px-2" style={{ color: 'var(--oc-text-muted)' }}>
              Signed in as <strong style={{ color: 'var(--oc-text)' }}>{user.fullName}</strong>
            </p>
            <div className="header-actions-mobile d-lg-flex align-items-lg-center gap-lg-2 pb-2 pb-lg-0">
              <ThemeToggle className="d-none d-lg-inline-flex" size="sm" />
              <span
                className="navbar-text small d-none d-lg-inline me-2"
                style={{ color: 'var(--oc-text-muted)' }}
              >
                {user.fullName}
              </span>
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
