"use client";

import React, { useState, useEffect } from "react";

export default function WhatsAppButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const phoneNumber = "254714584085";
  const defaultMessage = "Hi Kevotech, I am interested in your irrigation supplies.";
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      style={{
        position: "fixed",
        bottom: "30px",
        right: "30px",
        width: "60px",
        height: "60px",
        backgroundColor: "#25D366",
        color: "white",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 25px rgba(37, 211, 102, 0.4)",
        cursor: "pointer",
        zIndex: 9999,
        transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1) translateY(-5px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1) translateY(0)")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="34"
        height="34"
        fill="currentColor"
      >
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.606-1.446c.157-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.002 21.905c-1.639 0-3.21-.418-4.606-1.21l-5.111 1.343 1.365-4.981c-.86-1.428-1.314-3.084-1.314-4.786 0-5.462 4.443-9.905 9.905-9.905 5.461 0 9.905 4.443 9.905 9.905 0 5.463-4.444 9.904-9.904 9.904z" />
      </svg>
    </a>
  );
}
