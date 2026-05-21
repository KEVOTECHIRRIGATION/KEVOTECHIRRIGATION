"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Review = {
  id: number;
  product_id: string;
  product_name: string;
  customer_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/admin/reviews");
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
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
  }, [router]);

  const toggleApproval = async (id: number, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'hide' : 'approve'} this review?`)) return;
    
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_approved: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchReviews();
      } else {
        alert("Failed to update review.");
      }
    } catch (e) {
      alert("Error updating review.");
    }
  };

  const deleteReview = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchReviews();
      } else {
        alert("Failed to delete review.");
      }
    } catch (e) {
      alert("Error deleting review.");
    }
  };

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading reviews...</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "bold" }}>Product Reviews</h1>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "0.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        {reviews.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
            No reviews yet.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", textAlign: "left" }}>
              <tr>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#374151" }}>Product</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#374151" }}>Customer</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#374151" }}>Rating</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#374151" }}>Comment</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#374151" }}>Status</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#374151", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ fontWeight: 500 }}>{review.product_name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{new Date(review.created_at).toLocaleDateString()}</div>
                  </td>
                  <td style={{ padding: "1rem", color: "#374151" }}>{review.customer_name}</td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{ color: "#fbbf24", fontSize: "1.2rem" }}>
                      {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", maxWidth: "300px" }}>
                    <p style={{ margin: 0, fontSize: "0.875rem", color: "#4b5563", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={review.comment}>
                      {review.comment || "-"}
                    </p>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{ 
                      padding: "0.25rem 0.75rem", 
                      borderRadius: "9999px", 
                      fontSize: "0.75rem", 
                      fontWeight: 600,
                      backgroundColor: review.is_approved ? "#dcfce7" : "#fef3c7",
                      color: review.is_approved ? "#16a34a" : "#d97706"
                    }}>
                      {review.is_approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    <button 
                      onClick={() => toggleApproval(review.id, review.is_approved)}
                      style={{ padding: "0.4rem 0.8rem", backgroundColor: review.is_approved ? "#f3f4f6" : "#2563eb", color: review.is_approved ? "#374151" : "white", border: "none", borderRadius: "0.25rem", marginRight: "0.5rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500 }}
                    >
                      {review.is_approved ? "Hide" : "Approve"}
                    </button>
                    <button 
                      onClick={() => deleteReview(review.id)}
                      style={{ padding: "0.4rem 0.8rem", backgroundColor: "transparent", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: "0.25rem", cursor: "pointer", fontSize: "0.875rem" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
