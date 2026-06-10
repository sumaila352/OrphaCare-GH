'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/donate', label: 'Donate' },
];

function PublicNavLinks({
  pathname,
  onNavigate,
  className = 'navbar-nav mx-auto gap-lg-1',
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <ul className={className}>
      {links.map((l) => (
        <li className="nav-item" key={l.href}>
          <Link
            className={`nav-link ${pathname === l.href ? 'active' : ''}`}
            href={l.href}
            onClick={onNavigate}
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function PublicHeaderActions({ onNavigate, vertical = false }: { onNavigate?: () => void; vertical?: boolean }) {
  return (
    <div
      className={`header-actions d-flex ${vertical ? 'flex-column' : 'flex-row'} align-items-stretch align-items-lg-center gap-2`}
    >
      <ThemeToggle className="d-none d-lg-inline-flex" size="sm" />
      <Link className="btn-oc-ghost btn-oc-nav" href="/login" onClick={onNavigate}>
        Login
      </Link>
      <Link className="btn-oc-ghost btn-oc-nav" href="/register" onClick={onNavigate}>
        Join as donor
      </Link>
    </div>
  );
}

export function PublicHeader({ hero = false }: { hero?: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = document.getElementById('publicNav');
    if (!el) return;

    const onShow = () => setMenuOpen(true);
    const onHide = () => setMenuOpen(false);

    el.addEventListener('show.bs.offcanvas', onShow);
    el.addEventListener('hidden.bs.offcanvas', onHide);
    return () => {
      el.removeEventListener('show.bs.offcanvas', onShow);
      el.removeEventListener('hidden.bs.offcanvas', onHide);
    };
  }, []);

  function closeMenu() {
    const el = document.getElementById('publicNav');
    const bs = (window as Window & { bootstrap?: { Offcanvas?: { getInstance: (el: Element) => { hide: () => void } } } })
      .bootstrap;
    if (el && bs?.Offcanvas) {
      bs.Offcanvas.getInstance(el)?.hide();
    }
  }

  const solid = scrolled || !hero || menuOpen;

  return (
    <>
      <header
        className={`site-header ${hero ? 'site-header--hero' : ''} ${solid ? 'site-header--solid' : ''} ${menuOpen ? 'site-header--menu-open' : ''}`}
      >
        <nav className="navbar navbar-expand-lg">
          <div className="container px-3">
            <div className="d-flex align-items-center w-100 gap-2">
              <Link className="navbar-brand mb-0" href="/">
                <span className="brand-mark">
                  <i className="bi bi-heart-fill" />
                </span>
                <span className="brand-text">
                  OrphaCare <em>GH</em>
                </span>
              </Link>

              <div className="navbar-mobile-tools d-flex d-lg-none align-items-center gap-2 ms-auto flex-shrink-0">
                <ThemeToggle size="sm" />
                <button
                  className="navbar-toggler navbar-toggler-oc"
                  type="button"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#publicNav"
                  aria-controls="publicNav"
                  aria-expanded={menuOpen}
                  aria-label="Open menu"
                >
                  <span className="navbar-toggler-icon" />
                </button>
              </div>
            </div>

            <div className="d-none d-lg-flex align-items-center w-100 pt-0">
              <PublicNavLinks pathname={pathname} className="navbar-nav mx-auto gap-lg-1 flex-row" />
              <PublicHeaderActions />
            </div>
          </div>
        </nav>
      </header>

      <div
        className="offcanvas offcanvas-start public-offcanvas d-lg-none"
        tabIndex={-1}
        id="publicNav"
        aria-labelledby="publicNavLabel"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title fw-semibold" id="publicNavLabel">
            Menu
          </h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>
        <div className="offcanvas-body d-flex flex-column">
          <PublicNavLinks pathname={pathname} onNavigate={closeMenu} className="navbar-nav flex-column gap-1 mb-3" />
          <PublicHeaderActions onNavigate={closeMenu} vertical />
        </div>
      </div>
    </>
  );
}
