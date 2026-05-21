"use client";

import React, { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setMessage("Thank you! You have been subscribed successfully.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Subscription failed. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <section style={{ backgroundColor: "white", padding: "4rem 2rem", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }}>
      <div className="container" style={{ maxWidth: "600px", textAlign: "center" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem", color: "var(--text-primary)" }}>Join our Newsletter</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: 1.6 }}>
          Subscribe to get exclusive discounts, new product alerts, and expert agricultural tips directly to your inbox.
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            disabled={status === "loading" || status === "success"}
            style={{
              flex: "1 1 250px",
              padding: "0.875rem 1.25rem",
              borderRadius: "10px",
              border: "1.5px solid var(--border-color)",
              outline: "none",
              fontSize: "1rem",
              transition: "border-color 0.2s"
            }}
          />
          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            style={{
              padding: "0.875rem 2rem",
              backgroundColor: status === "success" ? "#16a34a" : "var(--primary-color)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: status === "loading" || status === "success" ? "default" : "pointer",
              transition: "all 0.2s"
            }}
          >
            {status === "loading" ? "Subscribing..." : status === "success" ? "Subscribed!" : "Subscribe"}
          </button>
        </form>

        {message && (
          <div style={{ marginTop: "1rem", fontSize: "0.9rem", fontWeight: 500, color: status === "error" ? "#dc2626" : "#16a34a" }}>
            {status === "error" ? "⚠️ " : "✓ "}{message}
          </div>
        )}
      </div>
    </section>
  );
}
