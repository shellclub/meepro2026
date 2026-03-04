"use client";

import { useState, useEffect } from "react";

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", image: "", sortOrder: 0, isActive: true });

  const fetchCategories = () => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => { setCategories(d.categories || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const generateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9ก-๙-]/g, "");

  const handleSubmit = async () => {
    const url = editId ? `/api/admin/categories/${editId}` : "/api/admin/categories";
    const method = editId ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    setEditId(null);
    setForm({ name: "", slug: "", description: "", image: "", sortOrder: 0, isActive: true });
    fetchCategories();
  };

  const handleEdit = (cat: any) => {
    setEditId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || "", image: cat.image || "", sortOrder: cat.sortOrder, isActive: cat.isActive });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ต้องการลบหมวดหมู่นี้?")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    fetchCategories();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#374151" };
  const btnPrimary: React.CSSProperties = {
    padding: "10px 20px", background: "#F28C28", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px",
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", margin: 0 }}>📁 จัดการหมวดหมู่</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>เพิ่ม แก้ไข ลบ หมวดหมู่สินค้า</p>
        </div>
        <button
          onClick={() => { setEditId(null); setForm({ name: "", slug: "", description: "", image: "", sortOrder: 0, isActive: true }); setShowForm(!showForm); }}
          style={btnPrimary}
        >
          {showForm ? "✕ ปิด" : "➕ เพิ่มหมวดหมู่"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", fontWeight: "600" }}>{editId ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={labelStyle}>ชื่อหมวดหมู่</label>
              <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })} placeholder="เช่น อาหารแมว" />
            </div>
            <div>
              <label style={labelStyle}>Slug</label>
              <input style={inputStyle} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="cat-food" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>คำอธิบาย</label>
              <textarea style={{ ...inputStyle, minHeight: "80px" }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="รายละเอียดหมวดหมู่" />
            </div>
            <div>
              <label style={labelStyle}>URL รูปภาพ</label>
              <input style={inputStyle} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <label style={labelStyle}>ลำดับ</label>
              <input style={inputStyle} type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </div>
            <div>
              <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "8px" }}>
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                เปิดใช้งาน
              </label>
            </div>
          </div>
          <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            <button onClick={handleSubmit} style={btnPrimary}>{editId ? "💾 บันทึก" : "➕ เพิ่ม"}</button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} style={{ ...btnPrimary, background: "#94a3b8" }}>ยกเลิก</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>กำลังโหลด...</div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>ยังไม่มีหมวดหมู่ กรุณาเพิ่มหมวดหมู่ หรือรัน Seed Script</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["ID", "ชื่อ", "Slug", "สินค้า", "ลำดับ", "สถานะ", "จัดการ"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#64748b" }}>{cat.id}</td>
                  <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{cat.name}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#64748b" }}><code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>{cat.slug}</code></td>
                  <td style={{ padding: "12px 16px", fontSize: "13px" }}>{cat._count?.products || 0}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px" }}>{cat.sortOrder}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "600", background: cat.isActive ? "#dcfce7" : "#fee2e2", color: cat.isActive ? "#16a34a" : "#dc2626" }}>
                      {cat.isActive ? "เปิด" : "ปิด"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => handleEdit(cat)} style={{ padding: "5px 10px", background: "#dbeafe", color: "#2563eb", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>✏️ แก้ไข</button>
                      <button onClick={() => handleDelete(cat.id)} style={{ padding: "5px 10px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>🗑️ ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
