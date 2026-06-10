'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { AuthUser } from '@/lib/api';
import { ThemeToggle } from './ThemeToggle';

const nav = [
  { href: '/my/donations', label: 'My impact', icon: 'bi-heart-fill' },
  { href: '/donate', label: 'Give now', icon: 'bi-gift-fill', highlight: true },
  { href: '/my/profile', label: 'Profile', icon: 'bi-person-fill' },
];

function DonorNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <ul className="nav donor-nav flex-column gap-1">
      {nav.map((item) => {
        const active =
          pathname === item.href || (item.href !== '/donate' && pathname.startsWith(item.href + '/'));
        return (
          <li key={item.href} className="nav-item">
            <Link
              className={`nav-link ${item.highlight ? 'nav-link-donate' : ''} ${active ? 'active' : ''}`}
              href={item.href}
              onClick={onNavigate}
            >
              <i className={`bi ${item.icon}`} aria-hidden />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function DonorShell({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const firstName = user.fullName.split(/\s+/)[0] ?? user.fullName;

  function logout() {
    localStorage.removeItem('token');
    router.push('/login');
  }

  function closeOffcanvas() {
    if (typeof document !== 'undefined') {
      const el = document.getElementById('donorNav');
      const bs = (window as Window & { bootstrap?: { Offcanvas?: { getInstance: (el: Element) => { hide: () => void } } } })
        .bootstrap;
      if (el && bs?.Offcanvas) {
        bs.Offcanvas.getInstance(el)?.hide();
      }
    }
  }

  return (
    <div className="donor-shell d-flex flex-column flex-lg-row min-vh-100">
      <header className="donor-topbar d-lg-none">
        <button
          className="btn admin-menu-btn"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#donorNav"
          aria-controls="donorNav"
          aria-label="Open menu"
        >
          <i className="bi bi-list" aria-hidden />
        </button>
        <Link href="/my/donations" className="donor-topbar-brand text-decoration-none text-truncate">
          OrphaCare GH
        </Link>
        <ThemeToggle size="sm" />
      </header>

      <div
        className="offcanvas offcanvas-start donor-offcanvas"
        tabIndex={-1}
        id="donorNav"
        aria-labelledby="donorNavLabel"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title fw-semibold" id="donorNavLabel">
            Donor portal
          </h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>
        <div className="offcanvas-body d-flex flex-column">
          <p className="donor-sidebar-tagline mb-3">
            Hello, <strong>{firstName}</strong> — thank you for caring.
          </p>
          <DonorNav pathname={pathname} onNavigate={closeOffcanvas} />
          <div className="mt-auto pt-3 d-grid gap-2">
            <Link href="/" className="btn btn-outline-primary" onClick={closeOffcanvas}>
              Public site
            </Link>
            <button className="btn btn-outline-secondary" type="button" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <aside className="donor-sidebar d-none d-lg-flex flex-column p-3 border-end">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
          <Link href="/my/donations" className="donor-sidebar-brand fs-5 text-decoration-none">
            OrphaCare GH
          </Link>
          <ThemeToggle size="sm" />
        </div>
        <p className="donor-sidebar-tagline mb-3">
          Donor portal · Every gift changes a life
        </p>
        <p className="small mb-3 offcanvas-user-meta">
          {user.fullName}
        </p>
        <DonorNav pathname={pathname} />
        <Link href="/" className="btn btn-outline-primary w-100 mt-auto">
          Public site
        </Link>
        <button className="btn btn-outline-secondary w-100 mt-2" type="button" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="donor-main flex-grow-1 w-100 min-w-0">
        <div className="container-fluid app-content py-3 py-md-4">{children}</div>
      </main>
    </div>
  );
}
