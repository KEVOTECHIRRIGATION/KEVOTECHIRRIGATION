"use client";

import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { parsePrice } from "../lib/utils";
import type { Product } from "../types";

export default function AddToCartBtn({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const minQty = product.min_order_quantity || 1;
  const [qty, setQty] = useState(minQty);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart({ ...product, price: parsePrice(product.price), minQty }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "0.5rem", overflow: "hidden" }}>
        <button
          onClick={() => setQty(Math.max(minQty, qty - 1))}
          style={{ padding: "0.75rem 1rem", background: "#f8fafc", color: "#475569", fontWeight: "bold", fontSize: "1.1rem" }}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <input
          type="number"
          value={qty}
          min={minQty}
          onChange={(e) => setQty(Math.max(minQty, parseInt(e.target.value) || minQty))}
          style={{ width: "56px", textAlign: "center", border: "none", padding: "0.75rem 0", fontWeight: "bold", outline: "none", fontFamily: "inherit" }}
          aria-label="Quantity"
        />
        <button
          onClick={() => setQty(qty + 1)}
          style={{ padding: "0.75rem 1rem", background: "#f8fafc", color: "#475569", fontWeight: "bold", fontSize: "1.1rem" }}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <button
        className="btn btn-primary"
        onClick={handleAdd}
        style={{ padding: "0.75rem 2rem", fontSize: "1rem", flex: 1, justifyContent: "center", transition: "all 0.2s", backgroundColor: added ? "#047857" : undefined }}
      >
        {added ? "Added!" : "Add to Cart"}
      </button>
    </div>
  );
}
