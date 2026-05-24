import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import Header from "../components/Header";
import CartDrawer from "../components/CartDrawer";
import AuthModal from "../components/AuthModal";
import WhatsAppButton from "../components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Kevotech Irrigation | Premium Agricultural Solutions",
  description: "International standard irrigation equipment, drip tapes, HDPE pipes, and fittings for modern agriculture.",
  openGraph: {
    title: "Kevotech Irrigation | Premium Agricultural Solutions",
    description: "International standard irrigation equipment, drip tapes, HDPE pipes, and fittings for modern agriculture in Kenya.",
    url: "https://kevotech-irrigation.com",
    siteName: "Kevotech Irrigation",
    images: [
      {
        url: "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "Kevotech Irrigation Systems",
      },
    ],
    locale: "en_KE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <Header />
            <CartDrawer />
            <AuthModal />
            <WhatsAppButton />
            <main>{children}</main>
          <footer className="footer">
            <div className="container">
              <div className="footer-grid">
                <div className="footer-col">
                  <div className="logo" style={{ color: 'white', marginBottom: '1rem', display: "flex" }}>
                    <img 
                      src="/kevotech-logo.jpg" 
                      alt="Kevotech Irrigation" 
                      style={{ height: "65px", width: "auto", objectFit: "contain", borderRadius: "8px" }} 
                    />
                  </div>
                  <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>Leading provider of high-quality irrigation systems and agricultural solutions tailored for optimal crop yield and water efficiency.</p>
                </div>
                <div className="footer-col">
                  <h3>Quick Links</h3>
                  <div className="footer-links">
                    <a href="/" className="footer-link">Home</a>
                    <a href="/shop" className="footer-link">Shop</a>
                    <a href="/about" className="footer-link">About Us</a>
                    <a href="/contact" className="footer-link">Contact</a>
                  </div>
                </div>
                <div className="footer-col">
                  <h3>Categories</h3>
                  <div className="footer-links">
                    <a href="/shop/pvc" className="footer-link">PVC Fittings &amp; Pipes</a>
                    <a href="/shop/hdpe" className="footer-link">HDPE Fittings &amp; Pipes</a>
                    <a href="/shop/sprinkler" className="footer-link">Sprinkler Systems</a>
                    <a href="/shop/tapes" className="footer-link">Drip Tapes</a>
                  </div>
                </div>
                <div className="footer-col">
                  <h3>Contact Us</h3>
                  <div className="footer-links">
                    <a href="mailto:info@kevotech.co.ke" className="footer-link">info@kevotech.co.ke</a>
                    <a href="tel:+254714584085" className="footer-link">+254 714 584 085</a>
                    <span className="footer-link">Nairobi, Kenya</span>
                  </div>
                </div>
              </div>
              <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Kevotech Irrigation. All rights reserved. Built with ❤️ by MesharkTech.</p>
              </div>
            </div>
          </footer>
        </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
