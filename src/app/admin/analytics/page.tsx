"use client";

import React, { useEffect, useState } from "react";
import { formatPrice } from "../../../lib/utils";

type RevenueRow  = { month: string; revenue: string; order_count: number };
type StatusRow   = { status: string; count: number };
type CategoryRow = { category: string; count: number };

type Analytics = {
  revenueByMonth:    RevenueRow[];
  ordersByStatus:    StatusRow[];
  productsByCategory: CategoryRow[];
};

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "#16a34a",
  PENDING:   "#d97706",
  FAILED:    "#dc2626",
  CANCELLED: "#64748b",
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d);
        else setError(d.error ?? "Failed to load analytics");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Analytics</h1>
        <p style={{ color: "#64748b", marginTop: "0.25rem", fontSize: "0.9rem" }}>Revenue trends, order breakdown, and catalogue distribution.</p>
      </div>

      {loading && <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>Loading analytics…</div>}
      {error && <div style={{ padding: "1.5rem", backgroundColor: "#fee2e2", borderRadius: "10px", color: "#dc2626", fontWeight: 500 }}>{error}</div>}

      {!loading && !error && data && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Revenue by month */}
          <Section title="Revenue by Month (Completed Orders)" subtitle="Last 6 months">
            {data.revenueByMonth.length === 0 ? (
              <Empty label="No completed orders yet." />
            ) : (
              <RevenueChart rows={data.revenueByMonth} />
            )}
          </Section>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {/* Orders by status */}
            <Section title="Orders by Status" subtitle="All time">
              {data.ordersByStatus.length === 0 ? (
                <Empty label="No orders yet." />
              ) : (
                <StatusBreakdown rows={data.ordersByStatus} />
              )}
            </Section>

            {/* Products by category */}
            <Section title="Products by Category" subtitle="Catalogue distribution">
              {data.productsByCategory.length === 0 ? (
                <Empty label="No products yet." />
              ) : (
                <CategoryBreakdown rows={data.productsByCategory} />
              )}
            </Section>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" }}>
      <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>{title}</h2>
        <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: "0.2rem 0 0" }}>{subtitle}</p>
      </div>
      <div style={{ padding: "1.5rem" }}>{children}</div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div style={{ textAlign: "center", color: "#94a3b8", padding: "2rem 0", fontSize: "0.875rem" }}>{label}</div>;
}

function RevenueChart({ rows }: { rows: RevenueRow[] }) {
  const maxRevenue = Math.max(...rows.map((r) => Number(r.revenue)), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {rows.map((row) => {
        const pct = (Number(row.revenue) / maxRevenue) * 100;
        return (
          <div key={row.month}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.3rem", color: "#475569" }}>
              <span style={{ fontWeight: 600 }}>{row.month}</span>
              <span>
                <span style={{ fontWeight: 700, color: "#16a34a" }}>{formatPrice(row.revenue)}</span>
                <span style={{ color: "#94a3b8", marginLeft: "0.5rem" }}>({row.order_count} order{row.order_count !== 1 ? "s" : ""})</span>
              </span>
            </div>
            <div style={{ height: "10px", backgroundColor: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, backgroundColor: "#16a34a", borderRadius: "999px", transition: "width 0.6s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusBreakdown({ rows }: { rows: StatusRow[] }) {
  const total = rows.reduce((s, r) => s + Number(r.count), 0) || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {rows.map((row) => {
        const pct = (Number(row.count) / total) * 100;
        const color = STATUS_COLORS[row.status] ?? "#64748b";
        return (
          <div key={row.status}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.3rem" }}>
              <span style={{ fontWeight: 600, color }}>{row.status}</span>
              <span style={{ color: "#475569" }}>{row.count} ({pct.toFixed(1)}%)</span>
            </div>
            <div style={{ height: "10px", backgroundColor: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, backgroundColor: color, borderRadius: "999px" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CategoryBreakdown({ rows }: { rows: CategoryRow[] }) {
  const total = rows.reduce((s, r) => s + Number(r.count), 0) || 1;
  const PALETTE = ["#6366f1", "#0284c7", "#16a34a", "#d97706", "#dc2626", "#db2777", "#7c3aed"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {rows.map((row, i) => {
        const pct = (Number(row.count) / total) * 100;
        const color = PALETTE[i % PALETTE.length];
        return (
          <div key={row.category}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.3rem" }}>
              <span style={{ fontWeight: 600, color: "#0f172a" }}>{row.category}</span>
              <span style={{ color: "#475569" }}>{row.count} SKU{row.count !== 1 ? "s" : ""}</span>
            </div>
            <div style={{ height: "10px", backgroundColor: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, backgroundColor: color, borderRadius: "999px" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
