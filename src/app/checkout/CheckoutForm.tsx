"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { KENYA_COUNTIES } from "../../lib/counties";
import { formatPrice, parsePrice } from "../../lib/utils";
import type { CartItem } from "../../types";
import type { Customer } from "../../lib/auth";

type Props = {
  token: string;
  items: CartItem[];
  totalPrice: number;
  expiresAt: string;
  customer: Customer | null;
};

type AuthMode = "guest" | "login" | "register";
type Step = "details" | "submitting" | "awaiting";

function useCountdown(expiresAt: string) {
  const expiry = new Date(expiresAt).getTime();
  const [remaining, setRemaining] = useState(() => expiry - Date.now());

  useEffect(() => {
    const id = setInterval(() => setRemaining(expiry - Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiry]);

  const mins = Math.max(0, Math.floor(remaining / 60000));
  const secs = Math.max(0, Math.floor((remaining % 60000) / 1000));
  return { mins, secs, expired: remaining <= 0, urgent: remaining < 5 * 60 * 1000 };
}

export default function CheckoutForm({ token, items, totalPrice, expiresAt, customer }: Props) {
  const router = useRouter();
  const { mins, secs, expired, urgent } = useCountdown(expiresAt);

  const [authMode, setAuthMode] = useState<AuthMode>(customer ? "guest" : "guest");
  const [loggedIn, setLoggedIn] = useState<Customer | null>(customer);
  const [step, setStep] = useState<Step>("details");
  const [error, setError] = useState("");

  // Customer details form
  const [form, setForm] = useState({
    name: customer?.name ?? "",
    phone: customer?.phone ?? "",
    email: customer?.email ?? "",
    address: customer?.address ?? "",
    county: customer?.county ?? "",
    notes: "",
    saveAccount: false,
    password: "",
    confirmPassword: "",
  });

  // Login form
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setLoggedIn(data.customer);
      setForm((p) => ({
        ...p,
        name: data.customer.name,
        phone: data.customer.phone,
        email: data.customer.email ?? "",
        address: data.customer.address ?? "",
        county: data.customer.county ?? "",
      }));
      setAuthMode("guest");
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setLoggedIn(null);
    setForm((p) => ({ ...p, name: "", phone: "", email: "", address: "", county: "" }));
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.saveAccount && !loggedIn) {
      if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
      if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    }

    setStep("submitting");
    try {
      const res = await fetch("/api/checkout/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...form }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setStep("awaiting");
      setTimeout(() => router.push(`/order/${data.orderId}`), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("details");
    }
  }, [form, token, router, loggedIn]);

  if (expired) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: "400px", padding: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⌛</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.75rem" }}>Session Expired</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Your 30-minute window has passed. Your cart is still saved.</p>
          <button onClick={() => router.push("/")} className="btn btn-primary" style={{ padding: "0.875rem 2rem" }}>Return to Cart</button>
        </div>
      </div>
    );
  }

  if (step === "awaiting") {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: "440px", padding: "2rem" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem", animation: "pulse 1.5s infinite" }}>📱</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.75rem", color: "var(--primary-dark)" }}>Check Your Phone</h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "0.5rem" }}>
            An M-Pesa STK Push has been sent to <strong>{form.phone}</strong>.
          </p>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Enter your M-Pesa PIN to complete payment. Redirecting to your order…</p>
          <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "80vh", backgroundColor: "#f8fafc", paddingBottom: "4rem" }}>
      {/* Header bar */}
      <div style={{ backgroundColor: "white", borderBottom: "1px solid var(--border-color)", padding: "1rem 0" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Secure Checkout</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {loggedIn && (
              <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                Signed in as <strong>{loggedIn.name.split(" ")[0]}</strong> ·{" "}
                <button onClick={handleLogout} style={{ color: "var(--primary-color)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}>Sign out</button>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem 0.85rem", borderRadius: "999px", backgroundColor: urgent ? "#fee2e2" : "#f0fdf4", color: urgent ? "#dc2626" : "#16a34a", fontSize: "0.875rem", fontWeight: 700 }}>
              <span>⏱</span>
              <span>{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr min(380px, 100%)", gap: "2rem", alignItems: "start" }}>

          {/* ── Left: Details form ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Auth section */}
            {!loggedIn && (
              <div style={{ backgroundColor: "white", borderRadius: "1rem", padding: "1.5rem", border: "1px solid var(--border-color)" }}>
                {authMode === "login" ? (
                  <>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem" }}>Sign In to Your Account</h2>
                    <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div>
                        <label style={lbl}>Email</label>
                        <input type="email" required value={loginForm.email} onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))} style={inp} />
                      </div>
                      <div>
                        <label style={lbl}>Password</label>
                        <input type="password" required value={loginForm.password} onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))} style={inp} />
                      </div>
                      {loginError && <p style={{ color: "#dc2626", fontSize: "0.875rem" }}>{loginError}</p>}
                      <button type="submit" disabled={loginLoading} className="btn btn-primary" style={{ justifyContent: "center", opacity: loginLoading ? 0.7 : 1 }}>
                        {loginLoading ? "Signing in…" : "Sign In"}
                      </button>
                      <button type="button" onClick={() => setAuthMode("guest")} style={{ color: "var(--text-secondary)", fontSize: "0.875rem", background: "none", border: "none", cursor: "pointer" }}>
                        Continue as guest instead
                      </button>
                    </form>
                  </>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", margin: 0 }}>Already have an account?</p>
                    <button onClick={() => setAuthMode("login")} className="btn btn-outline" style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}>Sign In</button>
                  </div>
                )}
              </div>
            )}

            {/* Customer details */}
            <form id="checkout-form" onSubmit={handleSubmit} style={{ backgroundColor: "white", borderRadius: "1rem", padding: "1.75rem", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Delivery Details</h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={lbl}>Full Name *</label>
                  <input required value={form.name} onChange={set("name")} placeholder="Jane Kamau" style={inp} />
                </div>
                <div>
                  <label style={lbl}>M-Pesa Phone *</label>
                  <input required type="tel" value={form.phone} onChange={set("phone")} placeholder="0712 345 678" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Email (optional)</label>
                  <input type="email" value={form.email} onChange={set("email")} placeholder="for receipt" style={inp} />
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={lbl}>Delivery Address *</label>
                  <input required value={form.address} onChange={set("address")} placeholder="Street, Town / Nearest landmark" style={inp} />
                </div>
                <div>
                  <label style={lbl}>County *</label>
                  <select required value={form.county} onChange={set("county")} style={inp}>
                    <option value="">Select county…</option>
                    {KENYA_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Notes (optional)</label>
                  <input value={form.notes} onChange={set("notes")} placeholder="Special instructions…" style={inp} />
                </div>
              </div>

              {/* Save account */}
              {!loggedIn && (
                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem" }}>
                  <label style={{ display: "flex", gap: "0.75rem", alignItems: "center", cursor: "pointer" }}>
                    <input type="checkbox" checked={form.saveAccount} onChange={(e) => setForm((p) => ({ ...p, saveAccount: e.target.checked }))} style={{ width: "16px", height: "16px", accentColor: "var(--primary-color)" }} />
                    <div>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Save details for next time</span>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0.1rem 0 0" }}>Create a free account for faster checkout</p>
                    </div>
                  </label>
                  {form.saveAccount && (
                    <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <label style={lbl}>Password *</label>
                        <input type="password" value={form.password} onChange={set("password")} placeholder="min. 8 characters" style={inp} />
                      </div>
                      <div>
                        <label style={lbl}>Confirm Password *</label>
                        <input type="password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="repeat password" style={inp} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div style={{ padding: "0.875rem 1rem", backgroundColor: "#fee2e2", borderRadius: "0.5rem", color: "#dc2626", fontSize: "0.875rem", fontWeight: 500 }}>{error}</div>
              )}
            </form>
          </div>

          {/* ── Right: Order summary ── */}
          <div style={{ position: "sticky", top: "80px", backgroundColor: "white", borderRadius: "1rem", border: "1px solid var(--border-color)", overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-color)", backgroundColor: "#f8fafc" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>Order Summary</h2>
            </div>

            <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "320px", overflowY: "auto" }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem", margin: "0 0 0.2rem", lineHeight: 1.3 }}>{item.name}</p>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", margin: 0 }}>Qty: {item.qty}</p>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: "0.875rem", whiteSpace: "nowrap", color: "var(--primary-dark)" }}>
                    {formatPrice(parsePrice(item.price) * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid var(--border-color)", backgroundColor: "#f8fafc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 800, marginBottom: "1.25rem" }}>
                <span>Total</span>
                <span style={{ color: "var(--primary-dark)" }}>{formatPrice(totalPrice)}</span>
              </div>
              <button
                type="submit"
                form="checkout-form"
                disabled={step === "submitting"}
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center", fontSize: "1rem", padding: "0.9rem", opacity: step === "submitting" ? 0.7 : 1 }}
              >
                {step === "submitting" ? "Processing…" : "Pay with M-Pesa"}
              </button>
              <p style={{ textAlign: "center", fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "0.75rem" }}>
                🔒 Secured by M-Pesa · Session expires in {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
              </p>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .container > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

const lbl: React.CSSProperties = { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.35rem" };
const inp: React.CSSProperties = { width: "100%", padding: "0.65rem 0.875rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", fontFamily: "inherit", fontSize: "0.925rem", outline: "none", color: "var(--text-primary)", boxSizing: "border-box" };
