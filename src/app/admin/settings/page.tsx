"use client";
import { useState, useEffect } from "react";

const defaultConfigs = [
  { group: "product", key: "available_colors", label: "สีที่มี (คั่นด้วย ,)", defaultValue: "ดำ,ขาว,น้ำตาล,เทา,ชมพู,ฟ้า,แดง,เขียว,ส้ม" },
  { group: "product", key: "available_sizes", label: "ไซส์ที่มี", defaultValue: "XS,S,M,L,XL,XXL" },
  { group: "product", key: "available_weights", label: "น้ำหนักที่มี", defaultValue: "100g,250g,500g,1kg,2kg,3kg,5kg,10kg" },
  { group: "product", key: "available_flavors", label: "รสชาติ", defaultValue: "ไก่,ปลาทู,ปลาทูน่า,ปลาแซลมอน,เนื้อ,กุ้ง,ทะเล" },
  { group: "product", key: "available_units", label: "หน่วยสินค้า", defaultValue: "ชิ้น,กรัม,กิโลกรัม,แพ็ค,ถุง,กล่อง,ขวด" },
  { group: "shop", key: "shop_name", label: "ชื่อร้าน", defaultValue: "MeePro PetShop" },
  { group: "shop", key: "shop_phone", label: "เบอร์โทร", defaultValue: "02-xxx-xxxx" },
  { group: "shop", key: "shop_email", label: "อีเมล", defaultValue: "info@meepro.com" },
  { group: "shop", key: "shop_address", label: "ที่อยู่ร้าน", defaultValue: "กรุงเทพมหานคร" },
  { group: "shipping", key: "free_shipping_min", label: "ยอดขั้นต่ำจัดส่งฟรี (บาท)", defaultValue: "500" },
  { group: "shipping", key: "shipping_fee", label: "ค่าจัดส่ง (บาท)", defaultValue: "50" },
];

export default function AdminSettings() {
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/config").then(r => r.json()).then(d => {
      const map: Record<string, string> = {};
      (d.configs || []).forEach((c: any) => { map[c.key] = c.value; });
      defaultConfigs.forEach(dc => { if (!map[dc.key]) map[dc.key] = dc.defaultValue; });
      setConfigs(map);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const payload = { configs: Object.entries(configs).map(([key, value]) => {
      const dc = defaultConfigs.find(d => d.key === key);
      return { key, value, group: dc?.group || "general" };
    })};
    await fetch("/api/admin/config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const groups = [
    { key: "product", label: "📐 ตั้งค่าสินค้า (สี, ไซส์, น้ำหนัก, รสชาติ)" },
    { key: "shop", label: "🏪 ข้อมูลร้านค้า" },
    { key: "shipping", label: "🚚 การจัดส่ง" },
  ];

  const iS: React.CSSProperties = { width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" };

  if (loading) return <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>กำลังโหลด...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", margin: 0 }}>⚙️ ตั้งค่าร้านค้า</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>จัดการค่าต่างๆ ของระบบร้านค้า</p>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ padding: "10px 24px", background: saving ? "#94a3b8" : "#F28C28", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>
          {saving ? "กำลังบันทึก..." : saved ? "✅ บันทึกแล้ว!" : "💾 บันทึกทั้งหมด"}
        </button>
      </div>

      {groups.map(group => (
        <div key={group.key} style={{ background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>{group.label}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px" }}>
            {defaultConfigs.filter(dc => dc.group === group.key).map(dc => (
              <div key={dc.key}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#374151" }}>{dc.label}</label>
                {dc.key.includes("address") ? (
                  <textarea style={{ ...iS, minHeight: "60px" }} value={configs[dc.key] || ""} onChange={e => setConfigs({ ...configs, [dc.key]: e.target.value })} />
                ) : (
                  <input style={iS} value={configs[dc.key] || ""} onChange={e => setConfigs({ ...configs, [dc.key]: e.target.value })} />
                )}
                {dc.key.startsWith("available_") && <p style={{ fontSize: "11px", color: "#94a3b8", margin: "4px 0 0 0" }}>ใส่ค่าคั่นด้วยเครื่องหมาย , (comma)</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
