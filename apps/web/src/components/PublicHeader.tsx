'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

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
          <Link className="navbar-brand" href="/">
            <span className="brand-mark">
              <i className="bi bi-heart-fill" />
            </span>
            <span className="brand-text">
              OrphaCare <em>GH</em>
            </span>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#publicNav"
            aria-label="Menu"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="publicNav">
            <ul className="navbar-nav mx-auto gap-lg-1">
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
            <div className="header-actions d-flex flex-column flex-lg-row gap-2">
              <Link className="btn btn-oc-ghost" href="/login">
                Login
              </Link>
              <Link className="btn btn-oc-primary" href="/register">
                Join as donor
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
