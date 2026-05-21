"use client";

import React from "react";
import { useCart } from "../context/CartContext";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, parsePrice } from "../lib/utils";
import type { Product } from "../types";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      <Link href={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <div style={{ position: "relative", width: "100%", height: "220px", backgroundColor: "#f1f5f9", flexShrink: 0 }}>
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8", gap: "0.5rem" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              <span style={{ fontSize: "0.75rem" }}>No Image</span>
            </div>
          )}
        </div>
        <div className="product-content" style={{ flexGrow: 1 }}>
          <span className="product-category">{product.category}</span>
          <h3 className="product-title">{product.name}</h3>
          <p className="product-desc" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", whiteSpace: "pre-wrap" }}>
            {product.description ?? "Premium irrigation equipment built to international standards."}
          </p>
        </div>
      </Link>

      <div className="product-footer" style={{ padding: "0 1.5rem 1.5rem", marginTop: "auto" }}>
        <span className="product-price">{formatPrice(product.price)}</span>
        <button
          className="btn btn-primary"
          style={{ padding: "0.6rem 1rem", fontSize: "0.9rem" }}
          onClick={() => addToCart({ ...product, price: parsePrice(product.price) })}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
