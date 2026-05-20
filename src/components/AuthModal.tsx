"use client";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const COUNTIES = [
  "Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika","Nyeri","Meru","Kiambu",
  "Machakos","Kakamega","Uasin Gishu","Trans Nzoia","Bungoma","Kisii","Migori",
  "Homa Bay","Siaya","Vihiga","Nandi","Kericho","Bomet","Narok","Kajiado","Murang'a",
  "Kirinyaga","Nyandarua","Laikipia","Samburu","Baringo","West Pokot","Elgeyo-Marakwet",
  "Turkana","Marsabit","Moyale","Isiolo","Tharaka-Nithi","Embu","Kitui","Makueni",
  "Kwale","Kilifi","Tana River","Lamu","Taita-Taveta","Garissa","Wajir","Mandera",
  "Nyamira","Rachuonyo"
];

export default function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, authMode, setAuthMode, login, register } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", county: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isAuthOpen) return null;

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = authMode === "login"
      ? await login(form.email, form.password)
      : await register({ name: form.name, email: form.email, phone: form.phone, password: form.password, county: form.county });

    setLoading(false);
    if (!result.success && result.error) setError(result.error);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setIsAuthOpen(false)}
        style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1000, backdropFilter: "blur(3px)" }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        zIndex: 1001, backgroundColor: "white", borderRadius: "16px",
        padding: "2.5rem", width: "100%", maxWidth: "420px",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)", maxHeight: "90vh", overflowY: "auto"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>
              {authMode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {authMode === "login" ? "Sign in to your Kevotech account" : "Join Kevotech Irrigation today"}
            </p>
          </div>
          <button onClick={() => setIsAuthOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "0.25rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {authMode === "register" && (
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input style={inputStyle} type="text" placeholder="John Kamau" value={form.name} onChange={(e) => update("name", e.target.value)} required />
            </div>
          )}

          <div>
            <label style={labelStyle}>Email Address *</label>
            <input style={inputStyle} type="email" placeholder="you@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} required />
          </div>

          {authMode === "register" && (
            <div>
              <label style={labelStyle}>Phone Number (M-Pesa) *</label>
              <input style={inputStyle} type="tel" placeholder="0712 345 678" value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
            </div>
          )}

          <div>
            <label style={labelStyle}>Password *</label>
            <input style={inputStyle} type="password" placeholder={authMode === "register" ? "At least 8 characters" : "••••••••"} value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={8} />
          </div>

          {authMode === "register" && (
            <div>
              <label style={labelStyle}>County</label>
              <select style={inputStyle} value={form.county} onChange={(e) => update("county", e.target.value)}>
                <option value="">Select county…</option>
                {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {error && (
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.875rem", fontWeight: 500 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.875rem", fontSize: "1rem", fontWeight: 700, marginTop: "0.5rem" }}
          >
            {loading ? "Please wait…" : authMode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Toggle */}
        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "#64748b" }}>
          {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setError(""); }}
            style={{ background: "none", border: "none", color: "var(--primary-color)", fontWeight: 700, cursor: "pointer", padding: 0 }}
          >
            {authMode === "login" ? "Sign up free" : "Sign in"}
          </button>
        </p>
      </div>
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem", letterSpacing: "0.01em"
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.7rem 0.9rem", border: "1.5px solid #e2e8f0", borderRadius: "8px",
  fontSize: "0.95rem", fontFamily: "inherit", outline: "none", transition: "border-color 0.2s",
  boxSizing: "border-box", backgroundColor: "#fafafa", color: "#0f172a"
};
