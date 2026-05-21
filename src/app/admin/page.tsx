"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "../../lib/utils";
import type { Order } from "../../types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

type Stats = {
  total_orders: string;
  total_revenue: string;
  pending_orders: string;
  completed_orders: string;
  total_products: string;
  total_customers: string;
  total_leads: string;
};

const STATUS_DOT: Record<string, string> = {
  PENDING: "#d97706",
  COMPLETED: "#16a34a",
  FAILED: "#dc2626",
  CANCELLED: "#64748b",
};

const COLORS = ['#0284c7', '#16a34a', '#d97706', '#7c3aed', '#db2777', '#059669'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Order[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [categoryDist, setCategoryDist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setRecent(data.recentOrders);
          setRevenueTrend(data.revenueTrend);
          setCategoryDist(data.categoryDist.map((item: any) => ({ ...item, value: Number(item.value) })));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: "Total Revenue",    value: formatPrice(stats.total_revenue),   color: "#16a34a", bg: "#dcfce7", icon: "KES" },
        { label: "Total Orders",     value: stats.total_orders,                  color: "#0284c7", bg: "#e0f2fe", icon: "📋" },
        { label: "Completed",        value: stats.completed_orders,              color: "#059669", bg: "#d1fae5", icon: "✅" },
        { label: "Products",         value: stats.total_products,                color: "#7c3aed", bg: "#ede9fe", icon: "📦" },
        { label: "Customers",        value: stats.total_customers,               color: "#db2777", bg: "#fce7f3", icon: "👥" },
        { label: "Email Leads",      value: stats.total_leads,                   color: "#d97706", bg: "#fef3c7", icon: "📧" },
      ]
    : [];

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Dashboard Analytics</h1>
        <p style={{ color: "#64748b", marginTop: "0.25rem", fontSize: "0.9rem" }}>Overview of your store performance.</p>
      </div>

      {loading ? (
        <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>Loading Analytics…</div>
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

          {/* Charts Row */}
          <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2.5rem", flexWrap: "wrap" }}>
            
            {/* Line Chart: Revenue */}
            <div style={{ flex: "2 1 500px", backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1.5rem", color: "#0f172a" }}>Monthly Revenue</h2>
              <div style={{ height: "300px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#64748b", fontSize: 12 }} 
                      tickFormatter={(val) => `Ksh ${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`Ksh ${Number(value).toLocaleString()}`, "Revenue"]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, fill: "#16a34a", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Categories */}
            <div style={{ flex: "1 1 300px", backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1.5rem", color: "#0f172a" }}>Products by Category</h2>
              <div style={{ height: "300px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDist}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [value, "Products"]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

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
        </>
      )}
    </div>
  );
}
