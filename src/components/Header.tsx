"use client";

import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/",        label: "Home" },
  { href: "/shop",    label: "Shop" },
  { href: "/about",   label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const { totalItems, setIsCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileOpen(false);
    const q = searchQuery.trim();
    router.push(q ? `/shop?search=${encodeURIComponent(q)}` : "/shop");
  };

  return (
    <>
      <header className="header">
        <div className="container header-content">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
              </svg>
            </div>
            <span className="logo-text">Kevotech</span>
          </Link>

          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              aria-label="Search products"
            />
            <button type="submit" className="search-btn" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </form>

          <nav className="nav-links desktop-nav">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="nav-link"
                style={{ color: isActive(href) ? 'var(--primary-color)' : undefined, fontWeight: isActive(href) ? 600 : undefined }}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              className="btn btn-primary cart-btn"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Cart (${totalItems} items)`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="cart-label">Cart</span>
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </button>

            <button
              className="hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="mobile-menu">
            <form onSubmit={handleSearch} className="mobile-search-form">
              <input
                type="text"
                placeholder="Search products…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                autoFocus
              />
              <button type="submit" className="btn btn-primary" style={{ padding: "0.6rem 1rem" }}>Go</button>
            </form>
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="mobile-nav-link"
                onClick={() => setMobileOpen(false)}
                style={{ color: isActive(href) ? 'var(--primary-color)' : undefined, fontWeight: isActive(href) ? 600 : undefined }}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <style>{`
        .search-form { flex: 1; max-width: 380px; margin: 0 1.5rem; display: flex; position: relative; }
        .search-input { width: 100%; padding: 0.6rem 2.5rem 0.6rem 1rem; border-radius: 2rem; border: 1px solid var(--border-color); outline: none; font-size: 0.95rem; font-family: inherit; transition: border-color 0.2s; }
        .search-input:focus { border-color: var(--primary-color); }
        .search-btn { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 0; display: flex; }
        .cart-badge { background: white; color: var(--primary-color); border-radius: 50%; padding: 0 0.4rem; font-size: 0.75rem; font-weight: 700; min-width: 1.25rem; text-align: center; line-height: 1.25rem; }
        .hamburger { display: none; align-items: center; justify-content: center; background: none; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.4rem; cursor: pointer; color: var(--text-primary); }
        .mobile-menu { border-top: 1px solid var(--border-color); padding: 1rem 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; background: white; }
        .mobile-search-form { display: flex; gap: 0.5rem; }
        .mobile-nav-link { font-weight: 500; color: var(--text-secondary); padding: 0.5rem 0; border-bottom: 1px solid var(--border-color); display: block; transition: color 0.15s; }
        .mobile-nav-link:hover { color: var(--primary-color); }
        .logo-text { display: inline; }
        @media (max-width: 768px) {
          .search-form { display: none; }
          .desktop-nav { display: none; }
          .hamburger { display: flex; }
          .cart-label { display: none; }
          .logo-text { display: none; }
        }
        @media (max-width: 480px) { .cart-btn { padding: 0.6rem 0.75rem; } }
      `}</style>
    </>
  );
}
