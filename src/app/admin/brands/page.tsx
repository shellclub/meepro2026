"use client";
import { useState, useEffect } from "react";

export default function AdminBrands() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", logo: "", isActive: true });

  const fetchBrands = () => {
    fetch("/api/admin/brands").then(r => r.json()).then(d => { setBrands(d.brands || []); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { fetchBrands(); }, []);

  const handleSubmit = async () => {
    const url = editId ? `/api/admin/brands/${editId}` : "/api/admin/brands";
    await fetch(url, { method: editId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false); setEditId(null); setForm({ name: "", slug: "", logo: "", isActive: true }); fetchBrands();
  };
  const handleDelete = async (id: number) => { if (!confirm("ลบ?")) return; await fetch(`/api/admin/brands/${id}`, { method: "DELETE" }); fetchBrands(); };

  const iS: React.CSSProperties = { width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" };
  const btn: React.CSSProperties = { padding: "10px 20px", background: "#F28C28", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", margin: 0 }}>🏷️ จัดการแบรนด์</h1>
        <button onClick={() => { setEditId(null); setForm({ name: "", slug: "", logo: "", isActive: true }); setShowForm(!showForm); }} style={btn}>{showForm ? "✕ ปิด" : "➕ เพิ่ม"}</button>
      </div>
      {showForm && (
        <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "20px", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div><label style={{ fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>ชื่อ</label><input style={iS} value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g,"-") })} /></div>
            <div><label style={{ fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>Slug</label><input style={iS} value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
            <div><label style={{ fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>Logo URL</label><input style={iS} value={form.logo} onChange={e => setForm({ ...form, logo: e.target.value })} /></div>
            <div><label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "25px" }}><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />เปิดใช้งาน</label></div>
          </div>
          <button onClick={handleSubmit} style={{ ...btn, marginTop: "15px" }}>{editId ? "💾 บันทึก" : "➕ เพิ่ม"}</button>
        </div>
      )}
      <div style={{ background: "#fff", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
        {loading ? <div style={{ padding: "40px", textAlign: "center" }}>กำลังโหลด...</div> : brands.length === 0 ? <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>ยังไม่มีแบรนด์</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#f8fafc" }}>{["ID","ชื่อ","Slug","สินค้า","สถานะ","จัดการ"].map(h => <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>{h}</th>)}</tr></thead>
            <tbody>{brands.map(b => (
              <tr key={b.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "12px 16px" }}>{b.id}</td>
                <td style={{ padding: "12px 16px", fontWeight: "600" }}>{b.name}</td>
                <td style={{ padding: "12px 16px", color: "#64748b" }}>{b.slug}</td>
                <td style={{ padding: "12px 16px" }}>{b._count?.products || 0}</td>
                <td style={{ padding: "12px 16px" }}><span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "600", background: b.isActive ? "#dcfce7" : "#fee2e2", color: b.isActive ? "#16a34a" : "#dc2626" }}>{b.isActive ? "เปิด" : "ปิด"}</span></td>
                <td style={{ padding: "12px 16px", display: "flex", gap: "6px" }}>
                  <button onClick={() => { setEditId(b.id); setForm({ name: b.name, slug: b.slug, logo: b.logo||"", isActive: b.isActive }); setShowForm(true); }} style={{ padding: "5px 10px", background: "#dbeafe", color: "#2563eb", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>✏️</button>
                  <button onClick={() => handleDelete(b.id)} style={{ padding: "5px 10px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>🗑️</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
