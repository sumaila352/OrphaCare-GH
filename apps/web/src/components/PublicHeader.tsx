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

export function PublicHeader({ hero = false }: { hero?: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solid = scrolled || !hero;

  return (
    <header
      className={`site-header ${hero ? 'site-header--hero' : ''} ${solid ? 'site-header--solid' : ''}`}
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
                data-bs-toggle="collapse"
                data-bs-target="#publicNav"
                aria-controls="publicNav"
                aria-expanded="false"
                aria-label="Open menu"
              >
                <span className="navbar-toggler-icon" />
              </button>
            </div>
          </div>

          <div className="collapse navbar-collapse" id="publicNav">
            <ul className="navbar-nav mx-auto gap-lg-1 pt-2 pt-lg-0">
              {links.map((l) => (
                <li className="nav-item" key={l.href}>
                  <Link
                    className={`nav-link ${pathname === l.href ? 'active' : ''}`}
                    href={l.href}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="header-actions d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2 pb-3 pb-lg-0">
              <ThemeToggle className="d-none d-lg-inline-flex" size="sm" />
              <Link className="btn-oc-ghost btn-oc-nav" href="/login">
                Login
              </Link>
              <Link className="btn-oc-ghost btn-oc-nav" href="/register">
                Join as donor
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
