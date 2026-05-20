"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        router.replace("/admin");
        router.refresh();
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a 0%, #1a3a2a 60%, #14532d 100%)"
    }}>
      <div style={{
        backgroundColor: "white", borderRadius: "20px", padding: "3rem",
        width: "100%", maxWidth: "400px", boxShadow: "0 25px 60px rgba(0,0,0,0.4)"
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "14px",
            background: "linear-gradient(135deg, #16a34a, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1rem", boxShadow: "0 4px 15px rgba(22,163,74,0.35)"
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Admin Panel</h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "0.35rem" }}>Kevotech Irrigation Management</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem" }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              placeholder="Enter admin username"
              required
              autoFocus
              style={{
                width: "100%", padding: "0.75rem 1rem", border: "1.5px solid #e2e8f0",
                borderRadius: "10px", fontSize: "0.95rem", fontFamily: "inherit",
                outline: "none", boxSizing: "border-box", transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#16a34a"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="••••••••"
              required
              style={{
                width: "100%", padding: "0.75rem 1rem", border: "1.5px solid #e2e8f0",
                borderRadius: "10px", fontSize: "0.95rem", fontFamily: "inherit",
                outline: "none", boxSizing: "border-box", transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#16a34a"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: "#fef2f2", border: "1px solid #fecaca",
              color: "#dc2626", padding: "0.75rem 1rem", borderRadius: "8px",
              fontSize: "0.875rem", fontWeight: 500
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "0.875rem",
              background: loading ? "#94a3b8" : "linear-gradient(135deg, #16a34a, #059669)",
              color: "white", border: "none", borderRadius: "10px",
              fontSize: "1rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              transition: "opacity 0.2s", marginTop: "0.25rem",
              boxShadow: loading ? "none" : "0 4px 15px rgba(22,163,74,0.35)"
            }}
          >
            {loading ? "Signing in…" : "Sign In to Admin"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.8rem", color: "#94a3b8" }}>
          Kevotech Irrigation © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
