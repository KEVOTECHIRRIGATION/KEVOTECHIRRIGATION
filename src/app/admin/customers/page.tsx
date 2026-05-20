"use client";

import React, { useEffect, useState, useMemo } from "react";
import { formatPrice } from "../../../lib/utils";
import type { Customer } from "../../../types";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCustomers(data.customers);
        else setError(data.error ?? "Failed to load customers");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.county ?? "").toLowerCase().includes(q)
    );
  }, [customers, search]);

  const exportCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "County", "Orders", "Total Spent (KES)", "Joined"];
    const rows = filtered.map((c) => [
      c.id,
      c.name,
      c.email ?? "",
      c.phone,
      c.county ?? "",
      c.order_count,
      Number(c.total_spent).toFixed(2),
      new Date(c.created_at).toISOString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kevotech-customers-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Customers</h1>
          <p style={{ color: "#64748b", marginTop: "0.25rem", fontSize: "0.9rem" }}>Registered accounts and their order history.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, email…"
            style={{ padding: "0.5rem 0.875rem", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.875rem", width: "240px", outline: "none" }}
          />
          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            style={{ padding: "0.6rem 1.25rem", backgroundColor: "#0f172a", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem", opacity: filtered.length === 0 ? 0.5 : 1 }}
          >
            Export CSV
          </button>
        </div>
      </div>

      {loading && <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>Loading customers…</div>}
      {error && <div style={{ padding: "1.5rem", backgroundColor: "#fee2e2", borderRadius: "10px", color: "#dc2626", fontWeight: 500 }}>{error}</div>}

      {!loading && !error && (
        <>
          <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.75rem" }}>
            {filtered.length} of {customers.length} customer{customers.length !== 1 ? "s" : ""}
          </p>
          <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👥</div>
                {customers.length === 0 ? "No registered customers yet." : "No customers match your search."}
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                      {["ID", "Name", "Contact", "County", "Orders", "Total Spent", "Joined"].map((h) => (
                        <th key={h} style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr key={c.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                        <td style={{ padding: "0.875rem 1rem", color: "#94a3b8", fontSize: "0.8rem" }}>#{c.id}</td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#0f172a" }}>{c.name}</div>
                        </td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <div style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "#475569" }}>{c.phone}</div>
                          {c.email && <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{c.email}</div>}
                        </td>
                        <td style={{ padding: "0.875rem 1rem", fontSize: "0.875rem", color: "#64748b" }}>{c.county ?? "—"}</td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <span style={{ backgroundColor: c.order_count > 0 ? "#dbeafe" : "#f1f5f9", color: c.order_count > 0 ? "#1d4ed8" : "#64748b", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 600 }}>
                            {c.order_count}
                          </span>
                        </td>
                        <td style={{ padding: "0.875rem 1rem", fontWeight: 700, color: "#059669", whiteSpace: "nowrap" }}>{formatPrice(c.total_spent)}</td>
                        <td style={{ padding: "0.875rem 1rem", fontSize: "0.75rem", color: "#64748b", whiteSpace: "nowrap" }}>
                          {new Date(c.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
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
