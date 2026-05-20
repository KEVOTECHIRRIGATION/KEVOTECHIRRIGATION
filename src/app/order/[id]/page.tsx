"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "../../../lib/utils";
import type { Order } from "../../../types";

const STATUS_CONFIG = {
  PENDING:   { icon: "📱", color: "#d97706", bg: "#fef3c7", label: "Awaiting M-Pesa Payment", message: "An STK Push was sent to your phone. Enter your M-Pesa PIN to complete payment." },
  COMPLETED: { icon: "✅", color: "#16a34a", bg: "#dcfce7", label: "Payment Confirmed",         message: "Your payment was received and your order is confirmed. We will contact you shortly with delivery details." },
  FAILED:    { icon: "❌", color: "#dc2626", bg: "#fee2e2", label: "Payment Failed",             message: "Your M-Pesa payment could not be completed. Please try again." },
  CANCELLED: { icon: "🚫", color: "#64748b", bg: "#f1f5f9", label: "Order Cancelled",            message: "This order has been cancelled." },
} as const;

type OrderWithDetails = Order & {
  customer_name?: string;
  customer_email?: string;
  delivery_address?: string;
  county?: string;
  notes?: string;
};

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success) setOrder(data.order);
      else setError(data.error ?? "Order not found");
    } catch {
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Poll every 5 seconds while PENDING
  useEffect(() => {
    if (order?.status !== "PENDING") return;
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [order?.status, fetchOrder]);

  if (loading) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
        <div style={{ width: "40px", height: "40px", border: "4px solid #e2e8f0", borderTopColor: "var(--primary-color)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "var(--text-secondary)" }}>Loading your order…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem" }}>
        <div>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.75rem" }}>Order Not Found</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>{error || "We couldn't find this order."}</p>
          <Link href="/" className="btn btn-primary">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div style={{ minHeight: "80vh", backgroundColor: "#f8fafc", padding: "3rem 0 5rem" }}>
      <div className="container" style={{ maxWidth: "680px" }}>

        {/* Status Card */}
        <div style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.color}33`, borderRadius: "1rem", padding: "2rem", textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>{cfg.icon}</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: cfg.color, marginBottom: "0.75rem" }}>{cfg.label}</h1>
          <p style={{ color: cfg.color, opacity: 0.85, lineHeight: 1.65, fontSize: "0.95rem", marginBottom: "0.5rem" }}>{cfg.message}</p>
          {order.status === "PENDING" && (
            <p style={{ fontSize: "0.8rem", color: cfg.color, opacity: 0.7 }}>This page refreshes automatically…</p>
          )}
        </div>

        {/* Order details */}
        <div style={{ backgroundColor: "white", borderRadius: "1rem", border: "1px solid var(--border-color)", overflow: "hidden", marginBottom: "1.5rem" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>Order #{order.id}</h2>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              {new Date(order.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          {/* Items */}
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)" }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0", borderBottom: i < items.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem", margin: "0 0 0.15rem" }}>{item.name}</p>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", margin: 0 }}>Qty: {item.qty}</p>
                </div>
                <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--primary-dark)" }}>{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.05rem", paddingTop: "1rem", marginTop: "0.5rem", borderTop: "2px solid var(--border-color)" }}>
              <span>Total</span>
              <span style={{ color: "var(--primary-dark)" }}>{formatPrice(order.total_price)}</span>
            </div>
          </div>

          {/* Delivery info */}
          <div style={{ padding: "1.25rem 1.5rem" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "1rem" }}>Delivery Information</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.875rem" }}>
              {[
                { label: "Name",     value: order.customer_name },
                { label: "Phone",    value: order.phone_number },
                { label: "Email",    value: order.customer_email },
                { label: "County",   value: order.county },
                { label: "Address",  value: order.delivery_address, full: true },
                order.mpesa_receipt_number ? { label: "M-Pesa Receipt", value: order.mpesa_receipt_number, full: true } : null,
              ].filter(Boolean).map((field) => field && (
                <div key={field.label} style={{ gridColumn: field.full ? "1/-1" : undefined }}>
                  <span style={{ fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "0.2rem" }}>{field.label}</span>
                  <span style={{ color: "var(--text-primary)" }}>{field.value || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/shop" className="btn btn-primary" style={{ padding: "0.875rem 2rem" }}>Continue Shopping</Link>
          {order.status === "FAILED" && (
            <Link href="/" className="btn btn-outline" style={{ padding: "0.875rem 2rem" }}>Try Again</Link>
          )}
        </div>
      </div>
    </div>
  );
}
