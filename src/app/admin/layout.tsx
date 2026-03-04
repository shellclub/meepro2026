"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { label: "แดชบอร์ด", href: "/admin", icon: "📊" },
  { label: "จัดการสินค้า", href: "/admin/products", icon: "📦" },
  { label: "จัดการหมวดหมู่", href: "/admin/categories", icon: "📁" },
  { label: "จัดการแบรนด์", href: "/admin/brands", icon: "🏷️" },
  { label: "คำสั่งซื้อ", href: "/admin/orders", icon: "🛒" },
  { label: "จัดการผู้ใช้งาน", href: "/admin/users", icon: "👥" },
  { label: "ตั้งค่าร้านค้า", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (pathname === '/admin/login' || pathname === '/admin/login/') {
    return <div style={{ minHeight: "100vh", background: "#f0f2f5" }}>{children}</div>;
  }

  return (
    <div style={{ margin: 0, fontFamily: "'Prompt', 'Sarabun', sans-serif" }}>
      <div style={{ display: "flex", minHeight: "100vh", background: "#f0f2f5" }}>
        {/* Sidebar */}
        <aside
          style={{
            width: sidebarOpen ? "260px" : "70px",
            background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
            color: "#fff",
            transition: "width 0.3s ease",
            display: "flex",
            flexDirection: "column",
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 100,
            overflowX: "hidden",
          }}
        >
          {/* Logo */}
          <div
            style={{
              padding: "20px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              minHeight: "70px",
            }}
          >
            <span style={{ fontSize: "28px" }}>🐱</span>
            {sidebarOpen && (
              <div>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#F28C28" }}>MeePro</div>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>Admin Panel</div>
              </div>
            )}
          </div>

          {/* Menu */}
          <nav style={{ flex: 1, padding: "10px 0" }}>
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 20px",
                    margin: "2px 8px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    color: isActive ? "#fff" : "#94a3b8",
                    background: isActive ? "rgba(242,140,40,0.2)" : "transparent",
                    borderLeft: isActive ? "3px solid #F28C28" : "3px solid transparent",
                    fontSize: "14px",
                    fontWeight: isActive ? "600" : "400",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ fontSize: "18px", minWidth: "24px", textAlign: "center" }}>{item.icon}</span>
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Back to store */}
          <div style={{ padding: "15px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <Link
              href="/home"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px",
                borderRadius: "8px",
                textDecoration: "none",
                color: "#94a3b8",
                fontSize: "13px",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <span>🏠</span>
              {sidebarOpen && <span>กลับหน้าร้านค้า</span>}
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <div style={{ flex: 1, marginLeft: sidebarOpen ? "260px" : "70px", transition: "margin-left 0.3s ease" }}>
          {/* Top bar */}
          <header
            style={{
              background: "#fff",
              padding: "0 30px",
              height: "70px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #e2e8f0",
              position: "sticky",
              top: 0,
              zIndex: 50,
            }}
          >
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: "none",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              {sidebarOpen ? "◀" : "▶"}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <span style={{ fontSize: "14px", color: "#64748b" }}>Admin</span>
              <button
                onClick={async () => {
                  if (confirm("คุณต้องการออกจากระบบหรือไม่?")) {
                    await fetch('/api/auth/logout/', { method: 'POST', cache: 'no-store' });
                    window.location.href = '/admin/login/';
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontWeight: "600",
                  marginLeft: "10px"
                }}
              >
                ออกจากระบบ
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main style={{ padding: "30px" }}>{children}</main>
        </div>
      </div>
    </div>
  );
}
