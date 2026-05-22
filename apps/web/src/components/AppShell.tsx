'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { AuthUser } from '@/lib/api';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { href: '/children', label: 'Children', icon: 'bi-people' },
  { href: '/staff', label: 'Staff', icon: 'bi-person-badge' },
  { href: '/donations', label: 'Donations', icon: 'bi-gift' },
  { href: '/inventory', label: 'Inventory', icon: 'bi-box-seam' },
  { href: '/reports', label: 'Reports', icon: 'bi-graph-up' },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <ul className="nav nav-pills flex-column gap-1">
      {nav.map((item) => (
        <li key={item.href} className="nav-item">
          <Link
            className={`nav-link ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}`}
            href={item.href}
            onClick={onNavigate}
          >
            <i className={`bi ${item.icon} me-2`} />
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function AppShell({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const role = user.roles[0] ?? 'user';

  function logout() {
    localStorage.removeItem('token');
    router.push('/login');
  }

  function closeOffcanvas() {
    if (typeof document !== 'undefined') {
      const el = document.getElementById('adminNav');
      const bs = (window as Window & { bootstrap?: { Offcanvas?: { getInstance: (el: Element) => { hide: () => void } } } })
        .bootstrap;
      if (el && bs?.Offcanvas) {
        bs.Offcanvas.getInstance(el)?.hide();
      }
    }
  }

  return (
    <div className="app-shell d-flex flex-column flex-lg-row min-vh-100">
      {/* Mobile top bar */}
      <header className="admin-topbar d-lg-none">
        <button
          className="btn btn-outline-secondary btn-sm"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#adminNav"
          aria-controls="adminNav"
          aria-label="Open menu"
        >
          <i className="bi bi-list fs-5" />
        </button>
        <Link href="/dashboard" className="admin-topbar-brand text-decoration-none">
          OrphaCare GH
        </Link>
        <span className="admin-topbar-user small text-muted text-truncate">{user.fullName}</span>
      </header>

      {/* Mobile offcanvas menu */}
      <div
        className="offcanvas offcanvas-start admin-offcanvas"
        tabIndex={-1}
        id="adminNav"
        aria-labelledby="adminNavLabel"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title fw-semibold" id="adminNavLabel">
            Menu
          </h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>
        <div className="offcanvas-body d-flex flex-column">
          <div className="small text-muted mb-3">
            {user.fullName} <span className="badge badge-soft ms-1">{role}</span>
          </div>
          <NavLinks pathname={pathname} onNavigate={closeOffcanvas} />
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

      {/* Desktop sidebar */}
      <aside className="sidebar d-none d-lg-flex flex-column p-3 bg-white border-end">
        <Link href="/dashboard" className="fs-5 fw-semibold text-decoration-none mb-3">
          OrphaCare GH
        </Link>
        <div className="small text-muted mb-3">
          {user.fullName} <span className="badge badge-soft ms-1">{role}</span>
        </div>
        <NavLinks pathname={pathname} />
        <Link href="/" className="btn btn-outline-primary w-100 mt-auto">
          Public site
        </Link>
        <button className="btn btn-outline-secondary w-100 mt-2" type="button" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="app-main flex-grow-1 w-100 min-w-0">
        <div className="container-fluid app-content">{children}</div>
      </main>
    </div>
  );
}
