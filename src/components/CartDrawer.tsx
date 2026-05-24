"use client";

import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "../lib/utils";

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQty, removeFromCart, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, totalPrice }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Could not start checkout");
      setIsCartOpen(false);
      clearCart();
      router.push(`/checkout?session=${data.token}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={() => setIsCartOpen(false)}
        style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1040, backdropFilter: "blur(2px)" }}
        aria-hidden="true"
      />
      <aside
        aria-label="Shopping cart"
        style={{ position: "fixed", top: 0, right: 0, height: "100dvh", width: "min(400px, 100vw)", backgroundColor: "white", zIndex: 1050, display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(0,0,0,0.15)", animation: "slideInCart 0.25s ease-out" }}
      >
        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
            Cart
            {items.length > 0 && <span style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 400, marginLeft: "0.5rem" }}>({items.length} item{items.length !== 1 ? "s" : ""})</span>}
          </h2>
          <button onClick={() => setIsCartOpen(false)} style={{ fontSize: "1.5rem", background: "none", border: "none", cursor: "pointer", color: "#64748b", lineHeight: 1 }} aria-label="Close cart">×</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem" }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", color: "#64748b", marginTop: "3rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛒</div>
              <p style={{ fontWeight: 500 }}>Your cart is empty</p>
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>Add some products to get started</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: "flex", gap: "0.875rem", alignItems: "center" }}>
                  <div style={{ position: "relative", width: "64px", height: "64px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, backgroundColor: "#f1f5f9" }}>
                    {item.image
                      ? <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} sizes="64px" />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "0.7rem" }}>No img</div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</h4>
                    <div style={{ color: "#059669", fontWeight: 700, fontSize: "0.875rem" }}>
                      {formatPrice(item.price * item.qty)}
                    </div>
                    {item.qty > 1 && <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{formatPrice(item.price)} each</div>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid #e2e8f0", borderRadius: "6px", overflow: "hidden" }}>
                      <button 
                        onClick={() => updateQty(item.id, item.qty - 1)} 
                        disabled={item.qty <= (item.minQty || 1)}
                        style={{ padding: "0.25rem 0.5rem", color: item.qty <= (item.minQty || 1) ? "#cbd5e1" : "#64748b", cursor: item.qty <= (item.minQty || 1) ? "not-allowed" : "pointer", background: "#f8fafc", fontSize: "1rem", lineHeight: 1, border: "none" }}
                      >−</button>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, minWidth: "1.5rem", textAlign: "center", padding: "0 0.25rem" }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ padding: "0.25rem 0.5rem", color: "#64748b", cursor: "pointer", background: "#f8fafc", fontSize: "1rem", lineHeight: 1, border: "none" }}>+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontSize: "0.7rem", padding: "0.2rem" }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem", fontSize: "1.125rem", fontWeight: 700 }}>
              <span>Total</span>
              <span style={{ color: "#059669" }}>{formatPrice(totalPrice)}</span>
            </div>

            {error && (
              <p style={{ color: "#dc2626", fontSize: "0.875rem", marginBottom: "0.75rem", fontWeight: 500 }}>{error}</p>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", fontSize: "1rem", padding: "0.9rem", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Starting checkout…" : "Proceed to Checkout →"}
            </button>
            <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.75rem" }}>
              🔒 Secure 30-minute checkout session
            </p>
          </div>
        )}
      </aside>

      <style>{`
        @keyframes slideInCart { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </>
  );
}
