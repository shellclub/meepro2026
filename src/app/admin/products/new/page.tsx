"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminProductForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", slug: "", description: "", shortDesc: "", sku: "", price: "", comparePrice: "", costPrice: "",
    stock: 0, weight: "", unit: "กรัม", isFeatured: false, isActive: true, status: "available",
    categoryId: "", brandId: "", tags: "",
    images: [{ url: "", alt: "" }],
    variants: [] as { name: string; value: string; priceAdjust: string; stock: number }[],
  });

  useEffect(() => {
    fetch("/api/admin/categories").then((r) => r.json()).then((d) => setCategories(d.categories || []));
    fetch("/api/admin/brands").then((r) => r.json()).then((d) => setBrands(d.brands || []));
  }, []);

  const generateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9ก-๙-]/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        costPrice: form.costPrice ? parseFloat(form.costPrice) : null,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        brandId: form.brandId ? Number(form.brandId) : null,
        images: form.images.filter((img) => img.url),
        variants: form.variants.map((v) => ({ ...v, priceAdjust: parseFloat(v.priceAdjust) || 0 })),
      };
      const res = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) router.push("/admin/products");
      else alert("เกิดข้อผิดพลาด");
    } catch { alert("เกิดข้อผิดพลาด"); }
    setSaving(false);
  };

  const addImage = () => setForm({ ...form, images: [...form.images, { url: "", alt: "" }] });
  const removeImage = (i: number) => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) });
  const addVariant = () => setForm({ ...form, variants: [...form.variants, { name: "ขนาด", value: "", priceAdjust: "0", stock: 0 }] });
  const removeVariant = (i: number) => setForm({ ...form, variants: form.variants.filter((_, idx) => idx !== i) });

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#374151" };

  return (
    <div style={{ maxWidth: "900px" }}>
      <div style={{ marginBottom: "25px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", margin: 0 }}>➕ เพิ่มสินค้าใหม่</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>📝 ข้อมูลพื้นฐาน</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>ชื่อสินค้า *</label>
              <input required style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })} placeholder="เช่น Royal Canin อาหารแมว" />
            </div>
            <div>
              <label style={labelStyle}>Slug</label>
              <input style={inputStyle} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>SKU</label>
              <input style={inputStyle} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU-001" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>คำอธิบายสั้น</label>
              <input style={inputStyle} value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} placeholder="อาหารแมวโปรดสำหรับแมวทุกสายพันธุ์" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>รายละเอียด</label>
              <textarea style={{ ...inputStyle, minHeight: "100px" }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>💰 ราคาและสต๊อก</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
            <div>
              <label style={labelStyle}>ราคาขาย (฿) *</label>
              <input required style={inputStyle} type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>ราคาเดิม (฿)</label>
              <input style={inputStyle} type="number" step="0.01" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>ราคาทุน (฿)</label>
              <input style={inputStyle} type="number" step="0.01" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>จำนวนในสต๊อก</label>
              <input style={inputStyle} type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            </div>
            <div>
              <label style={labelStyle}>น้ำหนัก</label>
              <input style={inputStyle} value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="1 kg" />
            </div>
            <div>
              <label style={labelStyle}>หน่วย</label>
              <select style={inputStyle} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                <option value="กรัม">กรัม</option>
                <option value="กิโลกรัม">กิโลกรัม</option>
                <option value="ชิ้น">ชิ้น</option>
                <option value="แพ็ค">แพ็ค</option>
                <option value="ถุง">ถุง</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category & Brand */}
        <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>🏷️ หมวดหมู่ & แบรนด์</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={labelStyle}>หมวดหมู่</label>
              <select style={inputStyle} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">-- เลือก --</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>แบรนด์</label>
              <select style={inputStyle} value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })}>
                <option value="">-- เลือก --</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>สถานะ</label>
              <select style={inputStyle} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="available">พร้อมขาย</option>
                <option value="out_of_stock">สินค้าหมด</option>
                <option value="discontinued">เลิกขาย</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tags (คั่นด้วย ,)</label>
              <input style={inputStyle} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="แมว, อาหาร, premium" />
            </div>
            <div>
              <label style={{ ...labelStyle, display: "flex", gap: "15px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> สินค้าแนะนำ
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> เปิดขาย
                </label>
              </label>
            </div>
          </div>
        </div>

        {/* Images */}
        <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>🖼️ รูปภาพ</h3>
            <button type="button" onClick={addImage} style={{ padding: "6px 12px", background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>➕ เพิ่มรูป</button>
          </div>
          {form.images.map((img, i) => (
            <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", marginBottom: "12px", background: "#fafbfc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", gap: "0" }}>
                  <button type="button" onClick={() => { const imgs = [...form.images]; (imgs[i] as any)._mode = "url"; setForm({ ...form, images: imgs }); }}
                    style={{ padding: "6px 14px", fontSize: "12px", fontWeight: "600", border: "1px solid #d1d5db", borderRadius: "6px 0 0 6px", cursor: "pointer", background: (img as any)._mode !== "upload" ? "#2563eb" : "#fff", color: (img as any)._mode !== "upload" ? "#fff" : "#374151" }}>
                    🔗 URL
                  </button>
                  <button type="button" onClick={() => { const imgs = [...form.images]; (imgs[i] as any)._mode = "upload"; setForm({ ...form, images: imgs }); }}
                    style={{ padding: "6px 14px", fontSize: "12px", fontWeight: "600", border: "1px solid #d1d5db", borderLeft: "none", borderRadius: "0 6px 6px 0", cursor: "pointer", background: (img as any)._mode === "upload" ? "#2563eb" : "#fff", color: (img as any)._mode === "upload" ? "#fff" : "#374151" }}>
                    📤 อัพโหลด
                  </button>
                </div>
                {form.images.length > 1 && <button type="button" onClick={() => removeImage(i)} style={{ padding: "6px 10px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>✕ ลบ</button>}
              </div>

              {(img as any)._mode !== "upload" ? (
                /* URL Mode */
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input style={{ ...inputStyle, flex: 1 }} value={img.url} onChange={(e) => { const imgs = [...form.images]; imgs[i].url = e.target.value; setForm({ ...form, images: imgs }); }} placeholder="https://example.com/image.jpg" />
                  <input style={{ ...inputStyle, width: "140px" }} value={img.alt} onChange={(e) => { const imgs = [...form.images]; imgs[i].alt = e.target.value; setForm({ ...form, images: imgs }); }} placeholder="Alt text" />
                </div>
              ) : (
                /* Upload Mode */
                <div>
                  <div
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.background = "#eff6ff"; }}
                    onDragLeave={(e) => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.background = "#fff"; }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = "#d1d5db";
                      e.currentTarget.style.background = "#fff";
                      const file = e.dataTransfer.files[0];
                      if (!file) return;
                      const fd = new FormData();
                      fd.append("files", file);
                      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                      const data = await res.json();
                      if (data.success && data.files?.[0]) {
                        const imgs = [...form.images];
                        imgs[i].url = data.files[0].url;
                        if (!imgs[i].alt) imgs[i].alt = file.name.replace(/\.[^/.]+$/, "");
                        setForm({ ...form, images: imgs });
                      } else {
                        alert(data.error || "อัพโหลดล้มเหลว");
                      }
                    }}
                    style={{ border: "2px dashed #d1d5db", borderRadius: "8px", padding: "24px", textAlign: "center", cursor: "pointer", background: "#fff", transition: "all 0.2s" }}
                    onClick={() => document.getElementById(`file-input-${i}`)?.click()}
                  >
                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>📁</div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#374151", fontWeight: "500" }}>คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>รองรับ JPG, PNG, WebP, GIF (ไม่เกิน 5MB)</p>
                  </div>
                  <input id={`file-input-${i}`} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const fd = new FormData();
                      fd.append("files", file);
                      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                      const data = await res.json();
                      if (data.success && data.files?.[0]) {
                        const imgs = [...form.images];
                        imgs[i].url = data.files[0].url;
                        if (!imgs[i].alt) imgs[i].alt = file.name.replace(/\.[^/.]+$/, "");
                        setForm({ ...form, images: imgs });
                      } else {
                        alert(data.error || "อัพโหลดล้มเหลว");
                      }
                    }}
                  />
                  <div style={{ marginTop: "8px" }}>
                    <input style={{ ...inputStyle, width: "100%" }} value={img.alt} onChange={(e) => { const imgs = [...form.images]; imgs[i].alt = e.target.value; setForm({ ...form, images: imgs }); }} placeholder="Alt text (คำอธิบายรูป)" />
                  </div>
                </div>
              )}

              {/* Preview */}
              {img.url && (
                <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <img src={img.url} alt={img.alt || ""} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                  <span style={{ fontSize: "12px", color: "#64748b", wordBreak: "break-all" }}>{img.url}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Variants */}
        <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>📐 ตัวเลือก (ขนาด/สี/รสชาติ)</h3>
            <button type="button" onClick={addVariant} style={{ padding: "6px 12px", background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>➕ เพิ่มตัวเลือก</button>
          </div>
          {form.variants.length === 0 && <p style={{ color: "#94a3b8", fontSize: "13px" }}>ยังไม่มีตัวเลือก</p>}
          {form.variants.map((v, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 80px auto", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
              <select style={inputStyle} value={v.name} onChange={(e) => { const vs = [...form.variants]; vs[i].name = e.target.value; setForm({ ...form, variants: vs }); }}>
                <option value="ขนาด">ขนาด</option>
                <option value="น้ำหนัก">น้ำหนัก</option>
                <option value="สี">สี</option>
                <option value="รสชาติ">รสชาติ</option>
              </select>
              <input style={inputStyle} value={v.value} onChange={(e) => { const vs = [...form.variants]; vs[i].value = e.target.value; setForm({ ...form, variants: vs }); }} placeholder="ค่า เช่น 1 kg" />
              <input style={inputStyle} type="number" step="0.01" value={v.priceAdjust} onChange={(e) => { const vs = [...form.variants]; vs[i].priceAdjust = e.target.value; setForm({ ...form, variants: vs }); }} placeholder="+฿" />
              <input style={inputStyle} type="number" value={v.stock} onChange={(e) => { const vs = [...form.variants]; vs[i].stock = Number(e.target.value); setForm({ ...form, variants: vs }); }} placeholder="สต๊อก" />
              <button type="button" onClick={() => removeVariant(i)} style={{ padding: "8px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", cursor: "pointer" }}>✕</button>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button type="submit" disabled={saving} style={{ padding: "12px 30px", background: "#F28C28", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "15px", opacity: saving ? 0.7 : 1 }}>
            {saving ? "กำลังบันทึก..." : "💾 บันทึกสินค้า"}
          </button>
          <button type="button" onClick={() => router.back()} style={{ padding: "12px 30px", background: "#94a3b8", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "15px" }}>ยกเลิก</button>
        </div>
      </form>
    </div>
  );
}
