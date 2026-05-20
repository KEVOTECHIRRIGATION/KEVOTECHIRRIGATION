"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "../../lib/utils";
import type { Order } from "../../types";

type Stats = {
  total_orders: string;
  total_revenue: string;
  pending_orders: string;
  completed_orders: string;
  total_products: string;
  total_customers: string;
};

const STATUS_DOT: Record<string, string> = {
  PENDING: "#d97706",
  COMPLETED: "#16a34a",
  FAILED: "#dc2626",
  CANCELLED: "#64748b",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setRecent(data.recentOrders);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: "Total Revenue",    value: formatPrice(stats.total_revenue),   color: "#16a34a", bg: "#dcfce7", icon: "KES" },
        { label: "Total Orders",     value: stats.total_orders,                  color: "#0284c7", bg: "#e0f2fe", icon: "📋" },
        { label: "Pending",          value: stats.pending_orders,                color: "#d97706", bg: "#fef3c7", icon: "⏳" },
        { label: "Completed",        value: stats.completed_orders,              color: "#059669", bg: "#d1fae5", icon: "✅" },
        { label: "Products",         value: stats.total_products,                color: "#7c3aed", bg: "#ede9fe", icon: "📦" },
        { label: "Customers",        value: stats.total_customers,               color: "#db2777", bg: "#fce7f3", icon: "👥" },
      ]
    : [];

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px" }}>
      {/* Page header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Dashboard</h1>
        <p style={{ color: "#64748b", marginTop: "0.25rem", fontSize: "0.9rem" }}>Overview of your store performance.</p>
      </div>

      {loading ? (
        <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>Loading…</div>
      ) : (
        <>
          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
            {statCards.map(({ label, value, color, bg, icon }) => (
              <div key={label} style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
                  <span style={{ backgroundColor: bg, color, borderRadius: "6px", padding: "0.2rem 0.4rem", fontSize: "0.75rem", fontWeight: 700 }}>{icon}</span>
                </div>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Recent orders */}
          <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "#0f172a" }}>Recent Orders</h2>
              <Link href="/admin/orders" style={{ fontSize: "0.825rem", color: "#16a34a", fontWeight: 600, textDecoration: "none" }}>View all →</Link>
            </div>

            {recent.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>No orders yet.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc" }}>
                      {["Order", "Customer", "Total", "Status", "Date"].map((h) => (
                        <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((order) => (
                      <tr key={order.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                        <td style={{ padding: "0.875rem 1rem", fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>#{order.id}</td>
                        <td style={{ padding: "0.875rem 1rem", fontSize: "0.875rem", color: "#475569" }}>
                          <div>{order.customer_name ?? "Guest"}</div>
                          <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontFamily: "monospace" }}>{order.phone_number}</div>
                        </td>
                        <td style={{ padding: "0.875rem 1rem", fontWeight: 700, color: "#059669", fontSize: "0.9rem", whiteSpace: "nowrap" }}>{formatPrice(order.total_price)}</td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", fontWeight: 600 }}>
                            <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: STATUS_DOT[order.status] ?? "#94a3b8", flexShrink: 0 }} />
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: "0.875rem 1rem", fontSize: "0.8rem", color: "#64748b", whiteSpace: "nowrap" }}>
                          {new Date(order.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick links */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
            {[
              { href: "/admin/products",  label: "Manage Products",  icon: "📦" },
              { href: "/admin/orders",    label: "Manage Orders",    icon: "📋" },
              { href: "/admin/customers", label: "View Customers",   icon: "👥" },
              { href: "/admin/analytics", label: "View Analytics",   icon: "📊" },
            ].map(({ href, label, icon }) => (
              <Link key={href} href={href} style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.25rem", textDecoration: "none", display: "flex", flexDirection: "column", gap: "0.5rem", transition: "box-shadow 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <span style={{ fontSize: "1.5rem" }}>{icon}</span>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a" }}>{label}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
