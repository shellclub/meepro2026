"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});

  const fetchProducts = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: "15" });
    if (search) params.set("search", search);
    fetch(`/api/admin/products?${params}`)
      .then((r) => r.json())
      .then((d) => { setProducts(d.products || []); setPagination(d.pagination || {}); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(page); }, [page]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchProducts(1); };

  const handleDelete = async (id: number) => {
    if (!confirm("ต้องการลบสินค้านี้?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    fetchProducts(page);
  };

  const btnPrimary: React.CSSProperties = {
    padding: "10px 20px", background: "#F28C28", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px", textDecoration: "none",
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", margin: 0 }}>📦 จัดการสินค้า</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>ดู แก้ไข เพิ่ม ลบ สินค้าในระบบ</p>
        </div>
        <Link href="/admin/products/new" style={btnPrimary}>➕ เพิ่มสินค้า</Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 ค้นหาสินค้า..."
          style={{ flex: 1, padding: "10px 16px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none" }}
        />
        <button type="submit" style={{ ...btnPrimary, background: "#3b82f6" }}>ค้นหา</button>
      </form>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>กำลังโหลด...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>ไม่พบสินค้า</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["รูป", "ชื่อสินค้า", "หมวดหมู่", "ราคา", "สต๊อก", "แนะนำ", "สถานะ", "จัดการ"].map((h) => (
                    <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ width: "45px", height: "45px", borderRadius: "8px", overflow: "hidden", background: "#f1f5f9" }}>
                        {p.images?.[0] ? <img src={p.images[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "18px" }}>📷</span>}
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>SKU: {p.sku || "-"}</div>
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: "13px", color: "#64748b" }}>{p.category?.name || "-"}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#F28C28" }}>฿{Number(p.price).toLocaleString()}</div>
                      {p.comparePrice && <div style={{ fontSize: "11px", color: "#94a3b8", textDecoration: "line-through" }}>฿{Number(p.comparePrice).toLocaleString()}</div>}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: "13px" }}>{p.stock}</td>
                    <td style={{ padding: "10px 14px" }}>{p.isFeatured ? "⭐" : "-"}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "600", background: p.isActive ? "#dcfce7" : "#fee2e2", color: p.isActive ? "#16a34a" : "#dc2626" }}>
                        {p.isActive ? "เปิด" : "ปิด"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <Link href={`/admin/products/${p.id}`} style={{ padding: "5px 10px", background: "#dbeafe", color: "#2563eb", border: "none", borderRadius: "6px", fontSize: "12px", textDecoration: "none" }}>✏️</Link>
                        <button onClick={() => handleDelete(p.id)} style={{ padding: "5px 10px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{ padding: "15px", display: "flex", justifyContent: "center", gap: "8px", borderTop: "1px solid #e2e8f0" }}>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  padding: "6px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  cursor: "pointer",
                  background: p === page ? "#F28C28" : "#fff",
                  color: p === page ? "#fff" : "#374151",
                  fontSize: "13px",
                  fontWeight: p === page ? "600" : "400",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
