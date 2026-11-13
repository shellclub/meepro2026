"use client";
import React, { useEffect, useState, useCallback } from "react";

const ACTION_LABEL: Record<string, string> = { create: "เพิ่ม", update: "แก้ไข", delete: "ลบ", import: "นำเข้า", login: "เข้าสู่ระบบ", login_failed: "เข้าสู่ระบบไม่สำเร็จ" };
const ACTION_COLOR: Record<string, string> = { create: "#16a34a", update: "#2563eb", delete: "#dc2626", import: "#9333ea", login: "#64748b", login_failed: "#ea580c" };
const ENTITY_LABEL: Record<string, string> = { product: "สินค้า", category: "หมวดหมู่", brand: "แบรนด์", order: "คำสั่งซื้อ", user: "ผู้ใช้", config: "ตั้งค่า", auth: "การเข้าระบบ" };

const iS: React.CSSProperties = { padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 };

export default function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const [f, setF] = useState({ username: "", entity: "", action: "", q: "", from: "", to: "" });

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const sp = new URLSearchParams({ page: String(page) });
    Object.entries(f).forEach(([k, v]) => v && sp.set(k, v));
    try {
      const r = await fetch(`/api/admin/audit-logs/?${sp}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "โหลดไม่สำเร็จ");
      setLogs(d.logs); setUsers(d.users); setTotalPages(d.pagination.totalPages); setTotal(d.pagination.total);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }, [page, f]);

  useEffect(() => { load(); }, [load]);
  const set = (k: string, v: string) => { setPage(1); setF({ ...f, [k]: v }); };
  const fmt = (s: string) => new Date(s).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "medium" });

  const renderChanges = (raw: string | null) => {
    if (!raw) return <em style={{ color: "#94a3b8" }}>ไม่มีรายละเอียด</em>;
    let c: any; try { c = JSON.parse(raw); } catch { return <pre>{raw}</pre>; }
    return (
      <table style={{ fontSize: 12, borderCollapse: "collapse" }}>
        <tbody>
          {Object.entries(c).map(([k, v]: any) => (
            <tr key={k}>
              <td style={{ padding: "2px 10px 2px 0", fontWeight: 600, verticalAlign: "top" }}>{k}</td>
              <td style={{ padding: "2px 0", wordBreak: "break-word" }}>
                {v && typeof v === "object" && "from" in v && "to" in v
                  ? <><span style={{ color: "#dc2626" }}>{JSON.stringify(v.from)}</span> → <span style={{ color: "#16a34a" }}>{JSON.stringify(v.to)}</span></>
                  : <span>{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1e293b", margin: 0 }}>🕘 ประวัติการใช้งาน</h1>
      <p style={{ color: "#64748b", margin: "4px 0 20px", fontSize: 14 }}>ใครทำอะไรกับข้อมูลเมื่อไร (เห็นได้เฉพาะ superadmin) — ทั้งหมด {total.toLocaleString()} รายการ</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <select style={iS} value={f.username} onChange={e => set("username", e.target.value)}>
          <option value="">ผู้ใช้ทั้งหมด</option>{users.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <select style={iS} value={f.entity} onChange={e => set("entity", e.target.value)}>
          <option value="">ทุกหมวด</option>{Object.entries(ENTITY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select style={iS} value={f.action} onChange={e => set("action", e.target.value)}>
          <option value="">ทุกการกระทำ</option>{Object.entries(ACTION_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input style={iS} type="date" value={f.from} onChange={e => set("from", e.target.value)} />
        <input style={iS} type="date" value={f.to} onChange={e => set("to", e.target.value)} />
        <input style={{ ...iS, minWidth: 220 }} placeholder="ค้นหา (ชื่อ/SKU/รหัส)" value={f.q} onChange={e => set("q", e.target.value)} />
      </div>

      {error && <div style={{ color: "#dc2626", marginBottom: 12 }}>{error}</div>}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f8fafc", textAlign: "left" }}>
              {["เวลา", "ผู้ใช้", "การกระทำ", "หมวด", "รายละเอียด", "IP"].map(h => <th key={h} style={{ padding: "10px 12px", fontWeight: 600, color: "#475569" }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ padding: 30, textAlign: "center", color: "#64748b" }}>กำลังโหลด...</td></tr>
              : logs.length === 0 ? <tr><td colSpan={6} style={{ padding: 30, textAlign: "center", color: "#64748b" }}>ยังไม่มีรายการ</td></tr>
              : logs.map(l => (
                <React.Fragment key={l.id}>
                  <tr onClick={() => setOpen(open === l.id ? null : l.id)} style={{ borderTop: "1px solid #f1f5f9", cursor: l.changes ? "pointer" : "default" }}>
                    <td style={{ padding: "9px 12px", whiteSpace: "nowrap" }}>{fmt(l.createdAt)}</td>
                    <td style={{ padding: "9px 12px", fontWeight: 600 }}>{l.username}</td>
                    <td style={{ padding: "9px 12px" }}><span style={{ color: "#fff", background: ACTION_COLOR[l.action] || "#64748b", padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>{ACTION_LABEL[l.action] || l.action}</span></td>
                    <td style={{ padding: "9px 12px" }}>{ENTITY_LABEL[l.entity] || l.entity}</td>
                    <td style={{ padding: "9px 12px" }}>{l.summary}{l.changes ? " ▾" : ""}</td>
                    <td style={{ padding: "9px 12px", color: "#94a3b8" }}>{l.ip || "-"}</td>
                  </tr>
                  {open === l.id && <tr style={{ background: "#f8fafc" }}><td colSpan={6} style={{ padding: "10px 16px" }}>{renderChanges(l.changes)}</td></tr>}
                </React.Fragment>
              ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", alignItems: "center", marginTop: 16, fontSize: 13 }}>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ ...iS, cursor: "pointer" }}>◀ ก่อนหน้า</button>
        <span>หน้า {page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={{ ...iS, cursor: "pointer" }}>ถัดไป ▶</button>
      </div>
    </div>
  );
}
