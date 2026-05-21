"use client";

import React, { useState, useEffect } from "react";

type Review = {
  id: number;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?product_id=${productId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rating) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, customer_name: name, rating, comment }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setMessage("Thank you! Your review has been submitted and is pending approval.");
        setName("");
        setComment("");
        setRating(5);
        setTimeout(() => {
          setFormOpen(false);
          setStatus("idle");
          setMessage("");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to submit review.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0";

  return (
    <div style={{ marginTop: "4rem", borderTop: "1px solid #e2e8f0", paddingTop: "3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Customer Reviews</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
            <span style={{ color: "#fbbf24", fontSize: "1.25rem" }}>
              {"★".repeat(Math.round(Number(avgRating)))}{"☆".repeat(5 - Math.round(Number(avgRating)))}
            </span>
            <span style={{ fontWeight: 600 }}>{avgRating} out of 5</span>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>({reviews.length} reviews)</span>
          </div>
        </div>
        <button 
          onClick={() => setFormOpen(!formOpen)}
          className="btn btn-primary" 
          style={{ padding: "0.75rem 1.5rem" }}
        >
          {formOpen ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} style={{ backgroundColor: "#f8fafc", padding: "2rem", borderRadius: "1rem", marginBottom: "3rem" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>Submit your review</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", maxWidth: "500px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>Name *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>Rating *</label>
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}>
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Very Good</option>
                <option value={3}>3 - Average</option>
                <option value={2}>2 - Poor</option>
                <option value={1}>1 - Terrible</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>Comment (Optional)</label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }} />
            </div>
            <button type="submit" disabled={status === "loading" || status === "success"} className="btn btn-primary" style={{ width: "100%", padding: "0.875rem", backgroundColor: status === "success" ? "#16a34a" : undefined }}>
              {status === "loading" ? "Submitting..." : status === "success" ? "Submitted!" : "Submit Review"}
            </button>
            {message && (
              <div style={{ fontSize: "0.9rem", fontWeight: 500, color: status === "error" ? "#dc2626" : "#16a34a" }}>
                {message}
              </div>
            )}
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ color: "var(--text-secondary)" }}>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>No reviews yet. Be the first to review this product!</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {reviews.map((review) => (
            <div key={review.id} style={{ paddingBottom: "1.5rem", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <strong style={{ color: "var(--text-primary)" }}>{review.customer_name}</strong>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
              <div style={{ color: "#fbbf24", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
              </div>
              {review.comment && <p style={{ color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
