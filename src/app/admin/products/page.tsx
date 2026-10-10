"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type SortKey = "name" | "category" | "status" | "price" | "stock" | "createdAt";
type StatusFilter = "" | "active" | "inactive";

const COLUMNS: { key: SortKey | null; label: string; width: string; align?: "right" | "center"; cls?: string }[] = [
  { key: null, label: "", width: "56px" },
  { key: "name", label: "ชื่อสินค้า", width: "auto" },
  { key: "category", label: "หมวดหมู่", width: "160px", cls: "col-category" },
  { key: "price", label: "ราคา", width: "120px", align: "right" },
  { key: "stock", label: "สต๊อก", width: "80px", align: "right", cls: "col-stock" },
  { key: "status", label: "สถานะ", width: "90px", align: "center" },
  { key: null, label: "", width: "84px" },
];

const PAGE_SIZES = [25, 50, 100];

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>({ page: 1, total: 0, totalPages: 1 });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [sort, setSort] = useState<SortKey>("createdAt");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [limit, setLimit] = useState(50);
  const [page, setPage] = useState(1);

  const bodyRef = useRef<HTMLDivElement>(null);
  const reqId = useRef(0);

  useEffect(() => {
    fetch("/api/admin/categories").then((r) => r.json()).then((d) => setCategories(d.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = () => {
    const id = ++reqId.current;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit), sort, dir });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (categoryId) params.set("categoryId", categoryId);
    if (status) params.set("status", status);
    fetch(`/api/admin/products?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (id !== reqId.current) return; // ignore out-of-order responses
        setProducts(d.products || []);
        setPagination(d.pagination || { page: 1, total: 0, totalPages: 1 });
        if (d.stats) setStats(d.stats);
        setLoading(false);
        bodyRef.current?.scrollTo({ top: 0 });
      })
      .catch(() => { if (id === reqId.current) setLoading(false); });
  };

  useEffect(fetchProducts, [page, limit, sort, dir, debouncedSearch, categoryId, status]);

  const toggleSort = (key: SortKey) => {
    if (sort === key) setDir(dir === "asc" ? "desc" : "asc");
    else { setSort(key); setDir(key === "createdAt" ? "desc" : "asc"); }
    setPage(1);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`ต้องการลบสินค้า "${name}" ?`)) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const resetFilters = () => { setSearch(""); setCategoryId(""); setStatus(""); setPage(1); };
  const hasFilters = !!(search || categoryId || status);

  const from = pagination.total === 0 ? 0 : (pagination.page - 1) * limit + 1;
  const to = Math.min(pagination.page * limit, pagination.total);

  // Windowed page numbers: 1 … 4 5 [6] 7 8 … 54
  const pageNumbers = (() => {
    const total = pagination.totalPages || 1;
    const set = new Set<number>([1, total, page - 2, page - 1, page, page + 1, page + 2]);
    const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
    const out: (number | "gap")[] = [];
    nums.forEach((n, i) => { if (i > 0 && n - nums[i - 1] > 1) out.push("gap"); out.push(n); });
    return out;
  })();

  const chip = (value: StatusFilter, label: string, count: number, color: string) => {
    const on = status === value;
    return (
      <button
        key={label}
        onClick={() => { setStatus(value); setPage(1); }}
        className="pl-chip"
        style={{ background: on ? color : "#fff", color: on ? "#fff" : "#475569", borderColor: on ? color : "#e2e8f0" }}
      >
        {label} <span style={{ opacity: on ? 0.9 : 0.6, fontWeight: 500 }}>{count.toLocaleString()}</span>
      </button>
    );
  };

  return (
    <div className="pl-root">
      <style>{`
        .pl-root { display: flex; flex-direction: column; height: calc(100vh - 130px); min-height: 480px; }
        .pl-btn { padding: 9px 16px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; text-decoration: none; color: #fff; white-space: nowrap; transition: filter .15s; }
        .pl-btn:hover { filter: brightness(1.08); }
        .pl-input { height: 38px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0 12px; font-size: 14px; background: #fff; color: #1e293b; outline: none; font-family: inherit; }
        .pl-input:focus { border-color: #F28C28; box-shadow: 0 0 0 3px rgba(242,140,40,.15); }
        .pl-chip { height: 38px; padding: 0 14px; border: 1px solid; border-radius: 999px; cursor: pointer; font-size: 13px; font-weight: 600; font-family: inherit; transition: all .15s; white-space: nowrap; }
        .pl-th { padding: 0 12px; height: 40px; font-size: 12px; font-weight: 600; color: #64748b; background: #f8fafc; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 1; white-space: nowrap; user-select: none; }
        .pl-th.sortable { cursor: pointer; }
        .pl-th.sortable:hover { color: #1e293b; background: #f1f5f9; }
        .pl-th.active { color: #F28C28; }
        .pl-tr { border-bottom: 1px solid #f1f5f9; transition: background .1s; }
        .pl-tr:hover { background: #fff8f0; }
        .pl-td { padding: 0 12px; height: 54px; overflow: hidden; }
        .pl-act { width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; border: none; cursor: pointer; font-size: 13px; text-decoration: none; transition: filter .15s; }
        .pl-act:hover { filter: brightness(.95); }
        .pl-page { min-width: 32px; height: 32px; padding: 0 8px; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; background: #fff; color: #374151; font-size: 13px; font-family: inherit; }
        .pl-page:disabled { opacity: .4; cursor: default; }
        @media (max-width: 1000px) { .col-category { display: none; } }
        @media (max-width: 760px) { .col-stock { display: none; } }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", margin: 0 }}>📦 จัดการสินค้า</h1>
          <p style={{ color: "#64748b", margin: "2px 0 0 0", fontSize: 13 }}>ทั้งหมด {stats.total.toLocaleString()} รายการ</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/admin/products/import" className="pl-btn" style={{ background: "#2563eb" }}>📥 นำเข้าจาก Excel</Link>
          <Link href="/admin/products/new" className="pl-btn" style={{ background: "#F28C28" }}>➕ เพิ่มสินค้า</Link>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: 200 }}>
          <span style={{ position: "absolute", left: 11, top: 9, fontSize: 14, opacity: 0.5 }}>🔍</span>
          <input
            className="pl-input"
            style={{ width: "100%", paddingLeft: 34 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อสินค้าหรือ SKU..."
          />
        </div>
        <select className="pl-input" value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }} style={{ maxWidth: 200 }}>
          <option value="">ทุกหมวดหมู่</option>
          <option value="none">ไม่มีหมวดหมู่</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div style={{ display: "flex", gap: 6 }}>
          {chip("", "ทั้งหมด", stats.total, "#475569")}
          {chip("active", "เปิดขาย", stats.active, "#16a34a")}
          {chip("inactive", "ปิด/รอตั้งราคา", stats.inactive, "#dc2626")}
        </div>
        {hasFilters && (
          <button onClick={resetFilters} className="pl-chip" style={{ background: "#fff", color: "#64748b", borderColor: "#e2e8f0" }}>✕ ล้างตัวกรอง</button>
        )}
      </div>

      {/* Table card: fills the viewport; only the rows scroll, header + footer stay put */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div ref={bodyRef} style={{ flex: 1, minHeight: 0, overflowY: "auto", opacity: loading ? 0.55 : 1, transition: "opacity .15s" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup>
              {COLUMNS.map((c, i) => <col key={i} className={c.cls} style={{ width: c.width }} />)}
            </colgroup>
            <thead>
              <tr>
                {COLUMNS.map((c, i) => {
                  const active = c.key !== null && sort === c.key;
                  return (
                    <th
                      key={i}
                      className={`pl-th ${c.key ? "sortable" : ""} ${active ? "active" : ""} ${c.cls || ""}`}
                      style={{ textAlign: c.align || "left" }}
                      onClick={c.key ? () => toggleSort(c.key as SortKey) : undefined}
                      title={c.key ? "คลิกเพื่อเรียงลำดับ" : undefined}
                    >
                      {c.label}
                      {c.key && <span style={{ marginLeft: 4, fontSize: 10, opacity: active ? 1 : 0.3 }}>{active ? (dir === "asc" ? "▲" : "▼") : "↕"}</span>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const pending = Number(p.price) <= 0;
                return (
                  <tr key={p.id} className="pl-tr">
                    <td className="pl-td">
                      <div style={{ width: 38, height: 38, borderRadius: 8, overflow: "hidden", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {p.images?.[0] ? <img src={p.images[0].url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 16 }}>📷</span>}
                      </div>
                    </td>
                    <td className="pl-td">
                      <Link href={`/admin/products/${p.id}`} title={p.name} style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#1e293b", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.isFeatured ? "⭐ " : ""}{p.name}
                      </Link>
                      <div style={{ fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.sku || "-"}
                      </div>
                    </td>
                    <td className="pl-td col-category" style={{ fontSize: 13, color: p.category ? "#475569" : "#cbd5e1", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                      {p.category?.name || "—"}
                    </td>
                    <td className="pl-td" style={{ textAlign: "right" }}>
                      {pending ? (
                        <span style={{ fontSize: 12, color: "#d97706", background: "#fef3c7", padding: "2px 8px", borderRadius: 10, fontWeight: 600, whiteSpace: "nowrap" }}>รอตั้งราคา</span>
                      ) : (
                        <>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#F28C28" }}>฿{Number(p.price).toLocaleString()}</div>
                          {p.comparePrice && <div style={{ fontSize: 11, color: "#94a3b8", textDecoration: "line-through" }}>฿{Number(p.comparePrice).toLocaleString()}</div>}
                        </>
                      )}
                    </td>
                    <td className="pl-td col-stock" style={{ textAlign: "right", fontSize: 13, fontWeight: 600, color: p.stock > 0 ? "#334155" : "#dc2626" }}>
                      {Number(p.stock).toLocaleString()}
                    </td>
                    <td className="pl-td" style={{ textAlign: "center" }}>
                      <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: p.isActive ? "#dcfce7" : "#fee2e2", color: p.isActive ? "#16a34a" : "#dc2626", whiteSpace: "nowrap" }}>
                        {p.isActive ? "เปิดขาย" : "ปิด"}
                      </span>
                    </td>
                    <td className="pl-td" style={{ textAlign: "right" }}>
                      <Link href={`/admin/products/${p.id}`} className="pl-act" style={{ background: "#dbeafe", color: "#2563eb", marginRight: 6 }} title="แก้ไข">✏️</Link>
                      <button onClick={() => handleDelete(p.id, p.name)} className="pl-act" style={{ background: "#fee2e2", color: "#dc2626" }} title="ลบ">🗑️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && products.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔎</div>
              ไม่พบสินค้าที่ตรงกับเงื่อนไข
              {hasFilters && <div><button onClick={resetFilters} style={{ marginTop: 10, background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: 14 }}>ล้างตัวกรอง</button></div>}
            </div>
          )}
          {loading && products.length === 0 && <div style={{ textAlign: "center", padding: 60, color: "#64748b" }}>กำลังโหลด...</div>}
        </div>

        {/* Footer: range + page size + pagination */}
        <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderTop: "1px solid #e2e8f0", background: "#fcfcfd" }}>
          <div style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 10 }}>
            <span>แสดง {from.toLocaleString()}–{to.toLocaleString()} จาก {Number(pagination.total).toLocaleString()}</span>
            <select className="pl-input" style={{ height: 30, fontSize: 13, padding: "0 6px" }} value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
              {PAGE_SIZES.map((n) => <option key={n} value={n}>{n} / หน้า</option>)}
            </select>
          </div>
          {pagination.totalPages > 1 && (
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <button className="pl-page" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>
              {pageNumbers.map((n, i) =>
                n === "gap" ? (
                  <span key={`g${i}`} style={{ color: "#94a3b8", padding: "0 2px" }}>…</span>
                ) : (
                  <button
                    key={n}
                    className="pl-page"
                    onClick={() => setPage(n)}
                    style={n === page ? { background: "#F28C28", color: "#fff", borderColor: "#F28C28", fontWeight: 600 } : undefined}
                  >
                    {n}
                  </button>
                )
              )}
              <button className="pl-page" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>›</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
