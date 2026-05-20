import type { Metadata } from "next";
import AdminSidebar from "./AdminSidebar";

export const metadata: Metadata = {
  title: "Admin | Kevotech Irrigation",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Suppress public site chrome when inside admin */}
      <style>{`
        header.header, header { display: none !important; }
        footer.footer { display: none !important; }
        main { padding: 0 !important; background: #f8fafc; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
        <AdminSidebar />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {children}
        </div>
      </div>
    </>
  );
}
