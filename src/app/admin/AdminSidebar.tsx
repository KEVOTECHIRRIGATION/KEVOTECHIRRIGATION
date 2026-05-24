"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin",           label: "Dashboard",  icon: "▦" },
  { href: "/admin/products",  label: "Products",   icon: "📦" },
  { href: "/admin/orders",    label: "Orders",     icon: "📋" },
  { href: "/admin/customers", label: "Customers",  icon: "👥" },
  { href: "/admin/reviews",   label: "Reviews",    icon: "⭐" },
  { href: "/admin/analytics", label: "Analytics",  icon: "📊" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      <aside style={{
        width: collapsed ? "60px" : "220px",
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s ease",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        overflow: "hidden",
      }}>
        {/* Brand */}
        <div style={{ padding: collapsed ? "1.25rem 0" : "1.25rem 1.25rem", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", gap: "0.5rem", minHeight: "64px" }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", overflow: "hidden" }}>
              <img src="/kevotech-logo.jpg" alt="Kevotech" style={{ width: "28px", height: "28px", objectFit: "contain", borderRadius: "4px" }} />
              <span style={{ color: "white", fontWeight: 700, fontSize: "0.9rem", whiteSpace: "nowrap" }}>Kevotech Admin</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Toggle sidebar"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: "1.1rem", padding: "0.25rem", flexShrink: 0, lineHeight: 1 }}
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0.75rem 0" }}>
          {NAV.map(({ href, label, icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: collapsed ? "0.75rem 0" : "0.75rem 1.25rem",
                  justifyContent: collapsed ? "center" : "flex-start",
                  color: active ? "#4ade80" : "#94a3b8",
                  fontWeight: active ? 600 : 400,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                  backgroundColor: active ? "#1e293b" : "transparent",
                  borderLeft: active ? "3px solid #16a34a" : "3px solid transparent",
                  transition: "background 0.15s, color 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = "#1e293b"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <span style={{ fontSize: "1rem", flexShrink: 0 }}>{icon}</span>
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer links */}
        <div style={{ padding: collapsed ? "1rem 0" : "1rem 1.25rem", borderTop: "1px solid #1e293b", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Link
            href="/"
            target="_blank"
            title={collapsed ? "View Site" : undefined}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b", fontSize: "0.8rem", textDecoration: "none", justifyContent: collapsed ? "center" : "flex-start" }}
          >
            <span>↗</span>
            {!collapsed && <span>View Site</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
