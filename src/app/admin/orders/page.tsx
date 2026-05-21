"use client";

import React, { useEffect, useState, useMemo } from "react";
import { formatPrice } from "../../../lib/utils";
import type { Order } from "../../../types";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  PENDING:   { bg: "#fef3c7", color: "#d97706" },
  COMPLETED: { bg: "#dcfce7", color: "#16a34a" },
  FAILED:    { bg: "#fee2e2", color: "#dc2626" },
  CANCELLED: { bg: "#f1f5f9", color: "#64748b" },
};

const ALL_STATUSES = ["ALL", "PENDING", "COMPLETED", "FAILED", "CANCELLED"] as const;
type StatusFilter = typeof ALL_STATUSES[number];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setOrders(data.orders);
        else setError(data.error ?? "Failed to load orders");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter((o) => {
      const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
      const matchSearch =
        !q ||
        String(o.id).includes(q) ||
        o.phone_number.includes(q) ||
        (o.customer_name ?? "").toLowerCase().includes(q) ||
        (o.mpesa_receipt_number ?? "").toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, search]);

  const counts = useMemo(
    () => ({
      ALL: orders.length,
      PENDING: orders.filter((o) => o.status === "PENDING").length,
      COMPLETED: orders.filter((o) => o.status === "COMPLETED").length,
      FAILED: orders.filter((o) => o.status === "FAILED").length,
      CANCELLED: orders.filter((o) => o.status === "CANCELLED").length,
    }),
    [orders]
  );

  const updateStatus = async (id: number, status: Order["status"]) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) setOrders((prev) => prev.map((o) => (o.id === id ? data.order : o)));
    } finally {
      setUpdating(null);
    }
  };

  const exportCSV = () => {
    const headers = ["ID", "Phone", "Customer Name", "Email", "County", "Status", "Total (KES)", "M-Pesa Receipt", "Date"];
    const rows = filtered.map((o) => [
      o.id,
      o.phone_number,
      o.customer_name ?? "",
      o.customer_email ?? "",
      o.county ?? "",
      o.status,
      Number(o.total_price).toFixed(2),
      o.mpesa_receipt_number ?? "",
      new Date(o.created_at).toISOString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kevotech-orders-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "2rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Orders</h1>
          <p style={{ color: "#64748b", marginTop: "0.25rem", fontSize: "0.9rem" }}>Manage customer orders and payment status.</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={filtered.length === 0}
          style={{ padding: "0.6rem 1.25rem", backgroundColor: "#0f172a", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem", opacity: filtered.length === 0 ? 0.5 : 1 }}
        >
          Export CSV ({filtered.length})
        </button>
      </div>

      {/* Status tabs + search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: "0.4rem 0.875rem",
                borderRadius: "999px",
                border: "1px solid",
                borderColor: statusFilter === s ? "#0f172a" : "#e2e8f0",
                backgroundColor: statusFilter === s ? "#0f172a" : "white",
                color: statusFilter === s ? "white" : "#475569",
                fontWeight: statusFilter === s ? 700 : 500,
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              {s} <span style={{ opacity: 0.7 }}>({counts[s]})</span>
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ID, phone, name, receipt…"
          style={{ padding: "0.5rem 0.875rem", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.875rem", width: "260px", outline: "none" }}
        />
      </div>

      {loading && <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>Loading orders…</div>}
      {error && <div style={{ padding: "1.5rem", backgroundColor: "#fee2e2", borderRadius: "10px", color: "#dc2626", fontWeight: 500 }}>{error}</div>}

      {!loading && !error && (
        <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📋</div>
              No orders match your filter.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                    {["#", "Customer", "Items", "Total", "Status", "M-Pesa Receipt", "Date", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => {
                    const style = STATUS_STYLES[order.status] ?? STATUS_STYLES.PENDING;
                    const items = Array.isArray(order.items) ? order.items : [];
                    return (
                      <tr key={order.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                        <td style={{ padding: "0.875rem 1rem", fontWeight: 700, color: "#0f172a" }}>#{order.id}</td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#0f172a" }}>{order.customer_name ?? "Guest"}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "monospace", marginTop: "2px" }}>{order.phone_number}</div>
                          {order.customer_email && <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{order.customer_email}</div>}
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>
                            {order.delivery_address && <span>{order.delivery_address}</span>}
                            {order.county && <span>, {order.county}</span>}
                          </div>
                          {order.notes && <div style={{ fontSize: "0.75rem", color: "#d97706", marginTop: "4px", fontStyle: "italic", maxWidth: "250px", whiteSpace: "normal" }}>"{order.notes}"</div>}
                        </td>
                        <td style={{ padding: "0.875rem 1rem", fontSize: "0.875rem", color: "#64748b" }}>{items.length} item{items.length !== 1 ? "s" : ""}</td>
                        <td style={{ padding: "0.875rem 1rem", fontWeight: 700, color: "#059669", whiteSpace: "nowrap" }}>{formatPrice(order.total_price)}</td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <span style={{ backgroundColor: style.bg, color: style.color, padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>{order.status}</span>
                        </td>
                        <td style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", fontFamily: "monospace", color: "#64748b" }}>{order.mpesa_receipt_number ?? "—"}</td>
                        <td style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "#64748b", whiteSpace: "nowrap" }}>
                          {new Date(order.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                            {order.status === "PENDING" && (
                              <>
                                <ActionBtn label="✓ Complete" color="#16a34a" bg="#dcfce7" border="#86efac" onClick={() => updateStatus(order.id, "COMPLETED")} disabled={updating === order.id} />
                                <ActionBtn label="✗ Fail"    color="#dc2626" bg="#fee2e2" border="#fca5a5" onClick={() => updateStatus(order.id, "FAILED")}    disabled={updating === order.id} />
                                <ActionBtn label="Cancel"    color="#64748b" bg="#f1f5f9" border="#e2e8f0" onClick={() => updateStatus(order.id, "CANCELLED")} disabled={updating === order.id} />
                              </>
                            )}
                            {order.status !== "PENDING" && (
                              <ActionBtn label="↺ Reopen" color="#d97706" bg="#fef3c7" border="#fde68a" onClick={() => updateStatus(order.id, "PENDING")} disabled={updating === order.id} />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ActionBtn({ label, color, bg, border, onClick, disabled }: {
  label: string; color: string; bg: string; border: string;
  onClick: () => void; disabled: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{ padding: "0.3rem 0.6rem", fontSize: "0.72rem", backgroundColor: bg, color, border: `1px solid ${border}`, borderRadius: "6px", cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600, opacity: disabled ? 0.6 : 1, whiteSpace: "nowrap" }}
    >
      {label}
    </button>
  );
}
