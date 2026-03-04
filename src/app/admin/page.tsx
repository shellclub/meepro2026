"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <div style={{ fontSize: "40px", marginBottom: "15px" }}>⏳</div>
        <p style={{ color: "#64748b" }}>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const statCards = [
    { label: "สินค้าทั้งหมด", value: stats.totalProducts || 0, icon: "📦", color: "#3b82f6", bg: "#eff6ff" },
    { label: "หมวดหมู่", value: stats.totalCategories || 0, icon: "📁", color: "#8b5cf6", bg: "#f5f3ff" },
    { label: "คำสั่งซื้อ", value: stats.totalOrders || 0, icon: "🛒", color: "#10b981", bg: "#ecfdf5" },
    { label: "รอดำเนินการ", value: stats.pendingOrders || 0, icon: "⏰", color: "#f59e0b", bg: "#fffbeb" },
    { label: "แบรนด์", value: stats.totalBrands || 0, icon: "🏷️", color: "#ec4899", bg: "#fdf2f8" },
    { label: "รายได้รวม", value: `฿${Number(stats.totalRevenue || 0).toLocaleString()}`, icon: "💰", color: "#059669", bg: "#ecfdf5" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", margin: 0 }}>แดชบอร์ด</h1>
        <p style={{ color: "#64748b", margin: "5px 0 0 0" }}>ภาพรวมร้านค้า MeePro PetShop</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        {statCards.map((card, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              border: "1px solid #e2e8f0",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>{card.label}</p>
                <p style={{ fontSize: "26px", fontWeight: "700", color: card.color, margin: "8px 0 0 0" }}>{card.value}</p>
              </div>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  background: card.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b", margin: "0 0 15px 0" }}>⚡ ทางลัด</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { label: "เพิ่มสินค้าใหม่", href: "/admin/products/new", icon: "➕" },
              { label: "จัดการหมวดหมู่", href: "/admin/categories", icon: "📁" },
              { label: "ดูคำสั่งซื้อ", href: "/admin/orders", icon: "📋" },
              { label: "ตั้งค่าร้านค้า", href: "/admin/settings", icon: "⚙️" },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 15px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: "#475569",
                  background: "#f8fafc",
                  fontSize: "14px",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b", margin: "0 0 15px 0" }}>📋 คำสั่งซื้อล่าสุด</h3>
          {(data?.recentOrders || []).length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center", padding: "20px 0" }}>ยังไม่มีคำสั่งซื้อ</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(data?.recentOrders || []).map((order: any) => (
                <div
                  key={order.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 15px",
                    borderRadius: "8px",
                    background: "#f8fafc",
                    fontSize: "13px",
                  }}
                >
                  <span style={{ fontWeight: "600" }}>#{order.orderNumber}</span>
                  <span style={{ color: "#64748b" }}>{order.customer?.firstName} {order.customer?.lastName}</span>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: "600",
                      background: order.status === "delivered" ? "#dcfce7" : order.status === "pending" ? "#fef3c7" : "#dbeafe",
                      color: order.status === "delivered" ? "#16a34a" : order.status === "pending" ? "#d97706" : "#2563eb",
                    }}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
