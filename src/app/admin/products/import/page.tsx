"use client";

import { useState } from "react";
import Link from "next/link";

type ImportRow = { row: number; sku: string; status: "created" | "updated" | "error"; message?: string };
type ImportSummary = {
  created: number;
  updated: number;
  errors: number;
  variantsImported?: number;
  pendingPrice?: number;
  categoryUnmatched?: number;
  bundlesLinked?: number;
};
type ImportResult = { success: boolean; summary: ImportSummary; results: ImportRow[] } | { error: string };

export default function AdminProductImport() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const btnPrimary: React.CSSProperties = {
    padding: "10px 20px", background: "#F28C28", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px", textDecoration: "none",
  };
  const card: React.CSSProperties = { background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" };

  const pickFile = (f: File | null) => {
    setResult(null);
    if (f && !/\.xlsx$/i.test(f.name)) {
      alert("รองรับเฉพาะไฟล์ .xlsx เท่านั้น");
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/products/import", { method: "POST", body: fd });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "เกิดข้อผิดพลาดระหว่างอัปโหลด กรุณาลองใหม่" });
    }
    setUploading(false);
  };

  const errorRows = result && "results" in result ? result.results.filter((r) => r.status === "error") : [];

  return (
    <div style={{ maxWidth: "900px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", margin: 0 }}>📥 นำเข้าสินค้าจาก Excel</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>เพิ่ม/อัปเดตสินค้าหลายรายการพร้อมกันด้วยไฟล์ Excel</p>
        </div>
        <Link href="/admin/products" style={{ ...btnPrimary, background: "#94a3b8" }}>← กลับไปหน้าสินค้า</Link>
      </div>

      <div style={card}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>1️⃣ ดาวน์โหลด Template</h3>
        <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 12px 0" }}>
          ใช้ไฟล์ template นี้เป็นต้นแบบ มีคำอธิบายทุกคอลัมน์ + รายชื่อหมวดหมู่/แบรนด์ปัจจุบัน + ตัวอย่างข้อมูลอยู่ในไฟล์แล้ว
        </p>
        <a href="/templates/product-import-template.xlsx" download style={{ ...btnPrimary, background: "#2563eb", display: "inline-block" }}>
          ⬇️ ดาวน์โหลด Template Excel
        </a>
        <p style={{ color: "#94a3b8", fontSize: "12px", margin: "12px 0 0 0" }}>
          รองรับไฟล์ export SKU จาก BigSeller ด้วย (ชีต "SKU" + "รายละเอียด Bundle SKU") — ระบบจะตรวจจับรูปแบบไฟล์ให้อัตโนมัติ ไฟล์กลุ่มนี้มักไม่มีราคาขายจริง สินค้าที่นำเข้าจะถูกปิดการขายไว้จนกว่าจะกรอกราคา
        </p>
      </div>

      <div style={card}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>2️⃣ อัปโหลดไฟล์ที่กรอกแล้ว</h3>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); pickFile(e.dataTransfer.files[0] || null); }}
          onClick={() => document.getElementById("excel-file-input")?.click()}
          style={{
            border: `2px dashed ${dragOver ? "#2563eb" : "#d1d5db"}`,
            borderRadius: "10px",
            padding: "32px",
            textAlign: "center",
            cursor: "pointer",
            background: dragOver ? "#eff6ff" : "#fafbfc",
            transition: "all 0.2s",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>📊</div>
          {file ? (
            <p style={{ margin: 0, fontSize: "14px", color: "#1e293b", fontWeight: "600" }}>{file.name}</p>
          ) : (
            <>
              <p style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#374151", fontWeight: "500" }}>คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</p>
              <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>ไฟล์ .xlsx เท่านั้น ขนาดไม่เกิน 10MB</p>
            </>
          )}
        </div>
        <input id="excel-file-input" type="file" accept=".xlsx" style={{ display: "none" }} onChange={(e) => pickFile(e.target.files?.[0] || null)} />

        <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
          <button type="button" disabled={!file || uploading} onClick={handleUpload} style={{ ...btnPrimary, opacity: !file || uploading ? 0.6 : 1, cursor: !file || uploading ? "not-allowed" : "pointer" }}>
            {uploading ? "กำลังนำเข้า..." : "📤 เริ่มนำเข้าข้อมูล"}
          </button>
          {file && !uploading && (
            <button type="button" onClick={() => { setFile(null); setResult(null); }} style={{ ...btnPrimary, background: "#fff", color: "#64748b", border: "1px solid #d1d5db" }}>
              ยกเลิก
            </button>
          )}
        </div>
      </div>

      {result && "error" in result && (
        <div style={{ ...card, background: "#fef2f2", border: "1px solid #fecaca" }}>
          <p style={{ margin: 0, color: "#dc2626", fontWeight: "600" }}>❌ {result.error}</p>
        </div>
      )}

      {result && "summary" in result && (
        <div style={card}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>ผลการนำเข้า</h3>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${result.summary.variantsImported !== undefined ? 4 : 3 + (result.summary.bundlesLinked ? 1 : 0)}, 1fr)`, gap: "12px", marginBottom: "8px" }}>
            <div style={{ background: "#f0fdf4", borderRadius: "8px", padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "22px", fontWeight: "700", color: "#16a34a" }}>{result.summary.created}</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>เพิ่มใหม่</div>
            </div>
            <div style={{ background: "#eff6ff", borderRadius: "8px", padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "22px", fontWeight: "700", color: "#2563eb" }}>{result.summary.updated}</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>อัปเดต</div>
            </div>
            {result.summary.variantsImported !== undefined && (
              <div style={{ background: "#f5f3ff", borderRadius: "8px", padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: "700", color: "#7c3aed" }}>{result.summary.variantsImported}</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>สินค้าที่มีตัวเลือก</div>
              </div>
            )}
            {result.summary.bundlesLinked !== undefined && (
              <div style={{ background: "#f5f3ff", borderRadius: "8px", padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: "700", color: "#7c3aed" }}>{result.summary.bundlesLinked}</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>สินค้าเซ็ต (Bundle)</div>
              </div>
            )}
            <div style={{ background: result.summary.errors > 0 ? "#fef2f2" : "#f8fafc", borderRadius: "8px", padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "22px", fontWeight: "700", color: result.summary.errors > 0 ? "#dc2626" : "#94a3b8" }}>{result.summary.errors}</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>ผิดพลาด</div>
            </div>
          </div>

          {result.summary.pendingPrice !== undefined && result.summary.pendingPrice > 0 && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "12px 14px", marginBottom: "20px", fontSize: "13px", color: "#92400e" }}>
              ⚠️ {result.summary.pendingPrice} รายการนำเข้าโดยยังไม่มีราคาขาย (ไฟล์นี้ไม่มีราคาขายจริง) ระบบตั้งเป็น <strong>ปิดการขาย</strong> ไว้ก่อน กรุณาเข้าไปกรอกราคาแล้วเปิดขายทีละรายการที่หน้าแก้ไขสินค้า
              {result.summary.categoryUnmatched !== undefined && result.summary.categoryUnmatched > 0 && <> · {result.summary.categoryUnmatched} รายการไม่พบหมวดหมู่ที่ตรงกันในระบบ (นำเข้าโดยไม่ระบุหมวดหมู่)</>}
            </div>
          )}

          {errorRows.length > 0 && (
            <>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "600", color: "#dc2626" }}>รายการที่ผิดพลาด (แก้ไขในไฟล์แล้วอัปโหลดใหม่เฉพาะแถวที่พลาด)</h4>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={{ padding: "8px 10px", textAlign: "left", borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>แถวที่</th>
                      <th style={{ padding: "8px 10px", textAlign: "left", borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>SKU</th>
                      <th style={{ padding: "8px 10px", textAlign: "left", borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>สาเหตุ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errorRows.map((r, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px 10px" }}>{r.row}</td>
                        <td style={{ padding: "8px 10px" }}>{r.sku}</td>
                        <td style={{ padding: "8px 10px", color: "#dc2626" }}>{r.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {(result.summary.created > 0 || result.summary.updated > 0) && (
            <div style={{ marginTop: "20px" }}>
              <Link href="/admin/products" style={btnPrimary}>ดูรายการสินค้า →</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
