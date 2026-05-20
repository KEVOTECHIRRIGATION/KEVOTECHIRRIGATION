"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "../../lib/utils";
import type { Product } from "../../types";

const CATEGORIES = [
  "PVC fittings and pipes",
  "HDPE fittings and pipes",
  "Sprinkler systems",
  "Drip Tapes",
  "Valves and accessories",
  "Pumps",
  "Other",
];

type Toast = { message: string; type: "success" | "error" };

type FormState = {
  name: string;
  category: string;
  price: string;
  description: string;
  imageUrl: string;
};

const EMPTY_FORM: FormState = { name: "", category: CATEGORIES[0], price: "", description: "", imageUrl: "" };

export default function AdminClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [toast, setToast] = useState<Toast | null>(null);
  const [loadingDescId, setLoadingDescId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: Toast["type"]) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setImagePreview("");
    setImageFile(null);
    setEditingId(null);
    setModalMode("add");
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      description: product.description ?? "",
      imageUrl: product.image ?? "",
    });
    setImagePreview(product.image ?? "");
    setImageFile(null);
    setEditingId(product.id);
    setModalMode("edit");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setImageFile(null);
    setImagePreview("");
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return form.imageUrl || null;
    const fd = new FormData();
    fd.append("file", imageFile);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!data.success) throw new Error(data.error ?? "Upload failed");
    return data.url as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const imageUrl = await uploadImage();

      const payload = {
        name: form.name.trim(),
        category: form.category,
        price: parseFloat(form.price),
        description: form.description.trim() || null,
        image: imageUrl,
      };

      let res: Response;
      if (modalMode === "add") {
        res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/admin/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      if (modalMode === "add") {
        setProducts((prev) => [data.product, ...prev]);
        showToast("Product added successfully!", "success");
      } else {
        setProducts((prev) => prev.map((p) => (p.id === editingId ? data.product : p)));
        showToast("Product updated successfully!", "success");
      }
      closeModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirmId(null);
      showToast("Product deleted.", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
    }
  };

  const generateDescription = async (product: Product) => {
    setLoadingDescId(product.id);
    try {
      const res = await fetch("/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, name: product.name, category: product.category }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, description: data.description } : p)));
      showToast("AI description generated!", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "AI failed", "error");
    } finally {
      setLoadingDescId(null);
    }
  };

  return (
    <>
      {/* Tab Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem" }}>
          <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--primary-color)", borderBottom: "2px solid var(--primary-color)", paddingBottom: "0.25rem" }}>Products ({products.length})</span>
          <Link href="/admin/orders" style={{ fontWeight: 500, color: "var(--text-secondary)", paddingBottom: "0.25rem" }}>Orders</Link>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      {/* Products Table */}
      <div style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)", overflow: "hidden", border: "1px solid var(--border-color)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "700px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={th}>Image</th>
                <th style={th}>Name</th>
                <th style={th}>Category</th>
                <th style={th}>Price</th>
                <th style={th}>Description</th>
                <th style={{ ...th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📦</div>
                    No products yet. Click "+ Add Product" to get started.
                  </td>
                </tr>
              )}
              {products.map((product) => (
                <tr key={product.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={{ padding: "1rem 1rem" }}>
                    <div style={{ position: "relative", width: "48px", height: "48px", borderRadius: "6px", overflow: "hidden", backgroundColor: "#f1f5f9", flexShrink: 0 }}>
                      {product.image ? (
                        <Image src={product.image} alt={product.name} fill style={{ objectFit: "cover" }} sizes="48px" />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1", fontSize: "0.65rem" }}>No img</div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "1rem 0.75rem", fontWeight: 600, fontSize: "0.925rem", maxWidth: "200px" }}>
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.2rem" }}>ID: {product.id}</div>
                  </td>
                  <td style={{ padding: "1rem 0.75rem" }}>
                    <span style={{ backgroundColor: "#e0f2fe", color: "#0284c7", padding: "0.2rem 0.65rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 500, whiteSpace: "nowrap" }}>
                      {product.category}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 0.75rem", fontWeight: 700, color: "var(--primary-dark)", whiteSpace: "nowrap" }}>
                    {formatPrice(product.price)}
                  </td>
                  <td style={{ padding: "1rem 0.75rem", maxWidth: "260px" }}>
                    <p style={{ margin: 0, fontSize: "0.825rem", color: "#64748b", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {product.description ?? <em style={{ color: "#94a3b8" }}>No description</em>}
                    </p>
                  </td>
                  <td style={{ padding: "1rem 0.75rem", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
                      <button
                        onClick={() => generateDescription(product)}
                        disabled={loadingDescId === product.id}
                        className="btn btn-outline"
                        style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.35rem", opacity: loadingDescId === product.id ? 0.6 : 1 }}
                      >
                        {loadingDescId === product.id ? "…" : "✨"} AI
                      </button>
                      <button
                        onClick={() => openEdit(product)}
                        className="btn"
                        style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem", backgroundColor: "#f1f5f9", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
                      >
                        Edit
                      </button>
                      {deleteConfirmId === product.id ? (
                        <>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="btn"
                            style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem", backgroundColor: "#ef4444", color: "white", border: "none" }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="btn"
                            style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem", backgroundColor: "#f1f5f9", border: "1px solid var(--border-color)" }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(product.id)}
                          className="btn"
                          style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem", backgroundColor: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <>
          <div
            onClick={closeModal}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 2000, backdropFilter: "blur(2px)" }}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(560px, 95vw)", maxHeight: "90vh", overflowY: "auto", backgroundColor: "white", borderRadius: "1rem", zIndex: 2001, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "modalIn 0.2s ease-out" }}
          >
            <div style={{ padding: "1.5rem 1.75rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 id="modal-title" style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
                {modalMode === "add" ? "Add New Product" : "Edit Product"}
              </h2>
              <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#64748b", lineHeight: 1 }}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "1.5rem 1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={label}>Product Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. 32mm HDPE Pipe — 100m Roll"
                  style={input}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={label}>Category *</label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={input}
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>Price (KES) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="e.g. 1500"
                    style={input}
                  />
                </div>
              </div>

              <div>
                <label style={label}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Leave blank to generate with AI after saving"
                  rows={4}
                  style={{ ...input, resize: "vertical", minHeight: "100px" }}
                />
              </div>

              <div>
                <label style={label}>Product Image</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{ border: "2px dashed #cbd5e1", borderRadius: "0.75rem", padding: "1.5rem", textAlign: "center", cursor: "pointer", backgroundColor: "#f8fafc", transition: "border-color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary-color)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
                >
                  {imagePreview ? (
                    <div style={{ position: "relative", width: "140px", height: "140px", margin: "0 auto 0.75rem", borderRadius: "0.5rem", overflow: "hidden" }}>
                      <Image src={imagePreview} alt="Preview" fill style={{ objectFit: "cover" }} sizes="140px" unoptimized={imagePreview.startsWith("blob:")} />
                    </div>
                  ) : (
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem", color: "#94a3b8" }}>📷</div>
                  )}
                  <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0 }}>
                    {imagePreview ? "Click to change image" : "Click to upload image"}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: "0.25rem 0 0" }}>JPEG, PNG, WebP — max 5MB</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImagePick} style={{ display: "none" }} />
                {form.imageUrl && !imageFile && (
                  <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#64748b" }}>
                    Current: <span style={{ color: "var(--primary-color)" }}>Image set</span>
                    <button type="button" onClick={() => { setForm({ ...form, imageUrl: "" }); setImagePreview(""); }} style={{ marginLeft: "0.75rem", color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem" }}>Remove</button>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={closeModal} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 2, justifyContent: "center", opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? (modalMode === "add" ? "Adding…" : "Saving…") : (modalMode === "add" ? "Add Product" : "Save Changes")}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: "2rem", right: "2rem", backgroundColor: toast.type === "success" ? "#059669" : "#ef4444", color: "white", padding: "1rem 1.5rem", borderRadius: "0.75rem", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)", zIndex: 9999, fontSize: "0.925rem", fontWeight: 500, maxWidth: "340px", animation: "slideInToast 0.3s ease-out" }}>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes modalIn { from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        @keyframes slideInToast { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}

const th: React.CSSProperties = { padding: "0.875rem 0.75rem", fontWeight: 600, color: "#475569", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" };
const label: React.CSSProperties = { display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.4rem" };
const input: React.CSSProperties = { width: "100%", padding: "0.65rem 0.875rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", outline: "none", fontFamily: "inherit", fontSize: "0.95rem", color: "var(--text-primary)", backgroundColor: "white" };
