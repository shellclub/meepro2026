"use client";

import { useState, useEffect } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});

  const fetchOrders = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: "15" });
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/orders?${params}`)
      .then((r) => r.json())
      .then((d) => { setOrders(d.orders || []); setPagination(d.pagination || {}); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(page); }, [page, statusFilter]);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/orders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    fetchOrders(page);
  };

  const statusColors: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: "#fef3c7", color: "#d97706", label: "รอดำเนินการ" },
    confirmed: { bg: "#dbeafe", color: "#2563eb", label: "ยืนยันแล้ว" },
    shipping: { bg: "#e0e7ff", color: "#4f46e5", label: "กำลังจัดส่ง" },
    delivered: { bg: "#dcfce7", color: "#16a34a", label: "จัดส่งแล้ว" },
    cancelled: { bg: "#fee2e2", color: "#dc2626", label: "ยกเลิก" },
  };

  return (
    <div>
      <div style={{ marginBottom: "25px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", margin: 0 }}>🛒 จัดการคำสั่งซื้อ</h1>
        <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>ดูและอัพเดทสถานะคำสั่งซื้อ</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { value: "", label: "ทั้งหมด" },
          { value: "pending", label: "รอดำเนินการ" },
          { value: "confirmed", label: "ยืนยันแล้ว" },
          { value: "shipping", label: "กำลังจัดส่ง" },
          { value: "delivered", label: "จัดส่งแล้ว" },
          { value: "cancelled", label: "ยกเลิก" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(1); }}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "1px solid #d1d5db",
              background: statusFilter === f.value ? "#F28C28" : "#fff",
              color: statusFilter === f.value ? "#fff" : "#475569",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: statusFilter === f.value ? "600" : "400",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>กำลังโหลด...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>ยังไม่มีคำสั่งซื้อ</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["เลขที่", "ลูกค้า", "รายการ", "ยอดรวม", "สถานะ", "วันที่", "อัพเดท"].map((h) => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const sc = statusColors[o.status] || statusColors.pending;
                return (
                  <tr key={o.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 14px", fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>#{o.orderNumber}</td>
                    <td style={{ padding: "12px 14px", fontSize: "13px", color: "#475569" }}>{o.customer?.firstName} {o.customer?.lastName}</td>
                    <td style={{ padding: "12px 14px", fontSize: "13px", color: "#64748b" }}>{o.items?.length || 0} รายการ</td>
                    <td style={{ padding: "12px 14px", fontSize: "14px", fontWeight: "600", color: "#F28C28" }}>฿{Number(o.total).toLocaleString()}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: "600", background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "12px", color: "#94a3b8" }}>{new Date(o.createdAt).toLocaleDateString("th-TH")}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        style={{ padding: "5px 8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}
                      >
                        <option value="pending">รอดำเนินการ</option>
                        <option value="confirmed">ยืนยัน</option>
                        <option value="shipping">จัดส่ง</option>
                        <option value="delivered">ส่งแล้ว</option>
                        <option value="cancelled">ยกเลิก</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
