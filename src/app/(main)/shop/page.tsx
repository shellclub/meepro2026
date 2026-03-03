"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { addItem } from "@/store/reducers/cartSlice";

function ProductCard({ product }: { product: any }) {
  const dispatch = useDispatch();
  const mainImage = product.images?.[0]?.url || "/assets/img/product-images/1_1.jpg";

  const handleAddToCart = () => {
    dispatch(
      addItem({
        id: product.id,
        title: product.name,
        newPrice: parseFloat(product.price),
        oldPrice: parseFloat(product.comparePrice || product.price),
        image: mainImage,
        imageTwo: product.images?.[1]?.url || mainImage,
        quantity: 1,
        waight: product.weight || "",
        date: "",
        status: product.status === "available" ? "Available" : "Out Of Stock",
        rating: parseFloat(product.rating) || 0,
        location: "",
        brand: product.brand?.name || "",
        sku: product.id,
        category: product.category?.name || "",
      })
    );
  };

  const discount = product.comparePrice
    ? Math.round(((parseFloat(product.comparePrice) - parseFloat(product.price)) / parseFloat(product.comparePrice)) * 100)
    : 0;

  return (
    <div style={{ background: "#fff", borderRadius: "12px", overflow: "hidden", border: "1px solid #f0f0f0", transition: "all 0.3s ease", height: "100%" }}
      onMouseEnter={(e) => { (e.currentTarget).style.boxShadow = "0 5px 20px rgba(242,140,40,0.15)"; }}
      onMouseLeave={(e) => { (e.currentTarget).style.boxShadow = "none"; }}
    >
      <div style={{ position: "relative", overflow: "hidden" }}>
        {discount > 0 && (
          <span style={{ position: "absolute", top: "10px", left: "10px", zIndex: 2, background: "#F28C28", color: "#fff", padding: "3px 10px", borderRadius: "15px", fontSize: "12px", fontWeight: "600" }}>
            -{discount}%
          </span>
        )}
        <Link href={`/product/${product.id}`}>
          <div style={{ width: "100%", paddingBottom: "100%", position: "relative", background: "#f9f9f9" }}>
            <img src={mainImage} alt={product.name}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => { (e.target as HTMLImageElement).src = "/assets/img/product-images/1_1.jpg"; }}
            />
          </div>
        </Link>
        <button onClick={handleAddToCart}
          style={{ position: "absolute", bottom: "10px", right: "10px", background: "#F28C28", color: "#fff", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", fontSize: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
          🛒
        </button>
      </div>
      <div style={{ padding: "15px" }}>
        {product.category && <span style={{ fontSize: "11px", color: "#999" }}>{product.category.name}</span>}
        <h6 style={{ margin: "5px 0 8px 0" }}>
          <Link href={`/product/${product.id}`} style={{ color: "#333", textDecoration: "none", fontSize: "14px", fontWeight: "600", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.4" }}>
            {product.name}
          </Link>
        </h6>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "5px" }}>
          {[...Array(5)].map((_, i) => (
            <span key={i} style={{ color: i < Math.round(parseFloat(product.rating)) ? "#FFD700" : "#ddd", fontSize: "12px" }}>★</span>
          ))}
          <span style={{ fontSize: "11px", color: "#999" }}>({product.reviewCount})</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#F28C28", fontWeight: "700", fontSize: "18px" }}>฿{parseFloat(product.price).toLocaleString()}</span>
          {product.comparePrice && parseFloat(product.comparePrice) > parseFloat(product.price) && (
            <span style={{ color: "#999", textDecoration: "line-through", fontSize: "14px" }}>฿{parseFloat(product.comparePrice).toLocaleString()}</span>
          )}
        </div>
        {product.weight && <div style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>{product.weight}</div>}
      </div>
    </div>
  );
}

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  useEffect(() => {
    fetch("/api/meepro/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "12");
    params.set("sort", sort);
    if (selectedCategory) params.set("category", selectedCategory);
    if (searchTerm) params.set("search", searchTerm);

    fetch(`/api/meepro/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, sort, selectedCategory, searchTerm]);

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ background: "linear-gradient(135deg, #FFF8F0, #FFF3E0)", padding: "20px 0" }}>
        <div className="container">
          <nav>
            <ol className="breadcrumb" style={{ margin: 0, background: "none" }}>
              <li className="breadcrumb-item"><Link href="/home" style={{ color: "#F28C28", textDecoration: "none" }}>หน้าแรก</Link></li>
              <li className="breadcrumb-item active" style={{ color: "#666" }}>สินค้าทั้งหมด</li>
            </ol>
          </nav>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#333", marginTop: "10px" }}>🛍️ สินค้าทั้งหมด</h1>
        </div>
      </div>

      <section style={{ padding: "30px 0" }}>
        <div className="container">
          <div className="row">
            {/* Sidebar Filters */}
            <div className="col-lg-3 col-md-4" style={{ marginBottom: "20px" }}>
              {/* Search */}
              <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", marginBottom: "20px", border: "1px solid #f0f0f0" }}>
                <h6 style={{ fontWeight: "600", marginBottom: "12px", color: "#333" }}>🔍 ค้นหาสินค้า</h6>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  placeholder="พิมพ์ชื่อสินค้า..."
                  style={{ width: "100%", padding: "10px 15px", borderRadius: "8px", border: "1px solid #ddd", outline: "none", fontSize: "14px" }}
                />
              </div>

              {/* Categories filter */}
              <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", marginBottom: "20px", border: "1px solid #f0f0f0" }}>
                <h6 style={{ fontWeight: "600", marginBottom: "12px", color: "#333" }}>📂 หมวดหมู่</h6>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: "8px" }}>
                    <button
                      onClick={() => { setSelectedCategory(""); setPage(1); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: selectedCategory === "" ? "#F28C28" : "#666", fontWeight: selectedCategory === "" ? "600" : "400", fontSize: "14px", padding: "5px 0" }}>
                      ทั้งหมด
                    </button>
                  </li>
                  {categories.map((cat: any) => (
                    <li key={cat.id} style={{ marginBottom: "8px" }}>
                      <button
                        onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: selectedCategory === cat.slug ? "#F28C28" : "#666", fontWeight: selectedCategory === cat.slug ? "600" : "400", fontSize: "14px", padding: "5px 0" }}>
                        {cat.name} ({cat._count?.products || 0})
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Products Grid */}
            <div className="col-lg-9 col-md-8">
              {/* Sort Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                <span style={{ color: "#666", fontSize: "14px" }}>
                  {loading ? "กำลังโหลด..." : `พบ ${products.length} รายการ`}
                </span>
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  style={{ padding: "8px 15px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none" }}
                >
                  <option value="newest">ใหม่ล่าสุด</option>
                  <option value="popular">ขายดี</option>
                  <option value="price_asc">ราคา ต่ำ → สูง</option>
                  <option value="price_desc">ราคา สูง → ต่ำ</option>
                  <option value="rating">คะแนนสูงสุด</option>
                </select>
              </div>

              {loading ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <div className="spinner-border" style={{ color: "#F28C28" }} />
                </div>
              ) : products.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>
                  <div style={{ fontSize: "48px", marginBottom: "15px" }}>🐱</div>
                  <h5>ไม่พบสินค้า</h5>
                  <p>ลองเปลี่ยนคำค้นหาหรือหมวดหมู่</p>
                </div>
              ) : (
                <>
                  <div className="row g-3">
                    {products.map((product) => (
                      <div key={product.id} className="col-6 col-md-6 col-lg-4">
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", gap: "5px", marginTop: "30px" }}>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i + 1)}
                          style={{
                            width: "40px", height: "40px", borderRadius: "8px",
                            border: page === i + 1 ? "none" : "1px solid #ddd",
                            background: page === i + 1 ? "#F28C28" : "#fff",
                            color: page === i + 1 ? "#fff" : "#666",
                            cursor: "pointer", fontWeight: "600",
                          }}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
