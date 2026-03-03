"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { addItem } from "@/store/reducers/cartSlice";

export default function ProductDetailPage() {
  const params = useParams();
  const dispatch = useDispatch();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/meepro/products/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setProduct(data.product);
          setRelatedProducts(data.relatedProducts || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product) return;
    const mainImage = product.images?.[0]?.url || "/assets/img/product-images/1_1.jpg";
    const price = selectedVariant
      ? parseFloat(product.price) + parseFloat(selectedVariant.priceAdjust)
      : parseFloat(product.price);

    dispatch(
      addItem({
        id: product.id,
        title: product.name + (selectedVariant ? ` - ${selectedVariant.value}` : ""),
        newPrice: price,
        oldPrice: parseFloat(product.comparePrice || product.price),
        image: mainImage,
        imageTwo: product.images?.[1]?.url || mainImage,
        quantity,
        waight: product.weight || "",
        date: "",
        status: "Available",
        rating: parseFloat(product.rating) || 0,
        location: "",
        brand: product.brand?.name || "",
        sku: product.id,
        category: product.category?.name || "",
      })
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <div className="spinner-border" style={{ color: "#F28C28" }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <h3>ไม่พบสินค้า</h3>
        <Link href="/shop" style={{ color: "#F28C28" }}>กลับไปหน้าสินค้า</Link>
      </div>
    );
  }

  const currentPrice = selectedVariant
    ? parseFloat(product.price) + parseFloat(selectedVariant.priceAdjust)
    : parseFloat(product.price);

  const images = product.images?.length > 0
    ? product.images
    : [{ url: "/assets/img/product-images/1_1.jpg", alt: product.name }];

  // Group variants by name
  const variantGroups: Record<string, any[]> = {};
  product.variants?.forEach((v: any) => {
    if (!variantGroups[v.name]) variantGroups[v.name] = [];
    variantGroups[v.name].push(v);
  });

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ background: "linear-gradient(135deg, #FFF8F0, #FFF3E0)", padding: "20px 0" }}>
        <div className="container">
          <nav>
            <ol className="breadcrumb" style={{ margin: 0, background: "none" }}>
              <li className="breadcrumb-item"><Link href="/home" style={{ color: "#F28C28", textDecoration: "none" }}>หน้าแรก</Link></li>
              <li className="breadcrumb-item"><Link href="/shop" style={{ color: "#F28C28", textDecoration: "none" }}>สินค้า</Link></li>
              {product.category && (
                <li className="breadcrumb-item">
                  <Link href={`/shop?category=${product.category.slug}`} style={{ color: "#F28C28", textDecoration: "none" }}>
                    {product.category.name}
                  </Link>
                </li>
              )}
              <li className="breadcrumb-item active" style={{ color: "#666" }}>{product.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      <section style={{ padding: "30px 0" }}>
        <div className="container">
          <div className="row">
            {/* Product Images */}
            <div className="col-lg-5 col-md-6" style={{ marginBottom: "30px" }}>
              <div style={{ background: "#f9f9f9", borderRadius: "12px", overflow: "hidden", marginBottom: "15px" }}>
                <div style={{ width: "100%", paddingBottom: "100%", position: "relative" }}>
                  <img
                    src={images[selectedImage]?.url}
                    alt={product.name}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "contain", padding: "20px" }}
                    onError={(e) => { (e.target as HTMLImageElement).src = "/assets/img/product-images/1_1.jpg"; }}
                  />
                </div>
              </div>
              {images.length > 1 && (
                <div style={{ display: "flex", gap: "10px", overflowX: "auto" }}>
                  {images.map((img: any, i: number) => (
                    <div
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      style={{
                        width: "70px", height: "70px", borderRadius: "8px", overflow: "hidden",
                        border: selectedImage === i ? "2px solid #F28C28" : "2px solid #eee",
                        cursor: "pointer", flexShrink: 0,
                      }}
                    >
                      <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { (e.target as HTMLImageElement).src = "/assets/img/product-images/1_1.jpg"; }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="col-lg-7 col-md-6">
              <div style={{ padding: "0 0 0 15px" }}>
                {product.brand && (
                  <span style={{ fontSize: "13px", color: "#F28C28", fontWeight: "500", textTransform: "uppercase" }}>
                    {product.brand.name}
                  </span>
                )}
                <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#333", margin: "8px 0 12px 0", lineHeight: "1.3" }}>
                  {product.name}
                </h1>

                {/* Rating */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: i < Math.round(parseFloat(product.rating)) ? "#FFD700" : "#ddd", fontSize: "16px" }}>★</span>
                  ))}
                  <span style={{ fontSize: "13px", color: "#999" }}>({product.reviewCount} รีวิว)</span>
                  <span style={{ fontSize: "13px", color: "#999" }}>| ขายแล้ว {product.salesCount} ชิ้น</span>
                </div>

                {/* Price */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", padding: "15px", background: "#FFF8F0", borderRadius: "10px" }}>
                  <span style={{ color: "#F28C28", fontWeight: "700", fontSize: "32px" }}>
                    ฿{currentPrice.toLocaleString()}
                  </span>
                  {product.comparePrice && parseFloat(product.comparePrice) > currentPrice && (
                    <>
                      <span style={{ color: "#999", textDecoration: "line-through", fontSize: "20px" }}>
                        ฿{parseFloat(product.comparePrice).toLocaleString()}
                      </span>
                      <span style={{ background: "#F28C28", color: "#fff", padding: "3px 10px", borderRadius: "15px", fontSize: "13px", fontWeight: "600" }}>
                        ลด {Math.round(((parseFloat(product.comparePrice) - currentPrice) / parseFloat(product.comparePrice)) * 100)}%
                      </span>
                    </>
                  )}
                </div>

                {/* Short Description */}
                {product.shortDesc && (
                  <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
                    {product.shortDesc}
                  </p>
                )}

                {/* Product Info */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px", fontSize: "14px" }}>
                  {product.weight && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span style={{ color: "#999" }}>น้ำหนัก:</span>
                      <span style={{ color: "#333", fontWeight: "500" }}>{product.weight}</span>
                    </div>
                  )}
                  {product.sku && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span style={{ color: "#999" }}>SKU:</span>
                      <span style={{ color: "#333", fontWeight: "500" }}>{product.sku}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span style={{ color: "#999" }}>สถานะ:</span>
                    <span style={{ color: product.stock > 0 ? "#28A745" : "#DC3545", fontWeight: "500" }}>
                      {product.stock > 0 ? `มีสินค้า (${product.stock})` : "สินค้าหมด"}
                    </span>
                  </div>
                </div>

                {/* Variants */}
                {Object.keys(variantGroups).length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    {Object.entries(variantGroups).map(([name, variants]) => (
                      <div key={name} style={{ marginBottom: "15px" }}>
                        <label style={{ fontWeight: "600", fontSize: "14px", color: "#333", marginBottom: "8px", display: "block" }}>
                          เลือก{name}:
                        </label>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {variants.map((v: any) => (
                            <button
                              key={v.id}
                              onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                              style={{
                                padding: "8px 18px", borderRadius: "8px",
                                border: selectedVariant?.id === v.id ? "2px solid #F28C28" : "1px solid #ddd",
                                background: selectedVariant?.id === v.id ? "#FFF3E0" : "#fff",
                                color: selectedVariant?.id === v.id ? "#F28C28" : "#666",
                                cursor: "pointer", fontSize: "13px", fontWeight: "500",
                              }}
                            >
                              {v.value}
                              {parseFloat(v.priceAdjust) !== 0 && (
                                <span style={{ fontSize: "11px", marginLeft: "5px" }}>
                                  ({parseFloat(v.priceAdjust) > 0 ? "+" : ""}฿{parseFloat(v.priceAdjust).toLocaleString()})
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quantity + Add to Cart */}
                <div style={{ display: "flex", gap: "15px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{ width: "40px", height: "40px", border: "none", background: "#f5f5f5", cursor: "pointer", fontSize: "18px" }}
                    >−</button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ width: "50px", height: "40px", border: "none", textAlign: "center", fontSize: "16px", fontWeight: "600" }}
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      style={{ width: "40px", height: "40px", border: "none", background: "#f5f5f5", cursor: "pointer", fontSize: "18px" }}
                    >+</button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    style={{
                      flex: 1, minWidth: "200px", padding: "12px 30px", borderRadius: "25px",
                      background: product.stock > 0 ? "#F28C28" : "#ccc",
                      color: "#fff", border: "none", fontSize: "16px", fontWeight: "600",
                      cursor: product.stock > 0 ? "pointer" : "not-allowed",
                    }}
                  >
                    🛒 เพิ่มลงตะกร้า
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div style={{ marginTop: "40px", padding: "30px", background: "#fff", borderRadius: "12px", border: "1px solid #f0f0f0" }}>
              <h4 style={{ fontWeight: "700", marginBottom: "15px", color: "#333" }}>📋 รายละเอียดสินค้า</h4>
              <div style={{ color: "#666", lineHeight: "1.8", fontSize: "14px", whiteSpace: "pre-line" }}>
                {product.description}
              </div>
            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div style={{ marginTop: "40px" }}>
              <h4 style={{ fontWeight: "700", marginBottom: "20px", color: "#333" }}>🔗 สินค้าที่เกี่ยวข้อง</h4>
              <div className="row g-3">
                {relatedProducts.slice(0, 4).map((rp: any) => (
                  <div key={rp.id} className="col-6 col-md-3">
                    <Link href={`/product/${rp.id}`} style={{ textDecoration: "none" }}>
                      <div style={{ background: "#fff", borderRadius: "12px", overflow: "hidden", border: "1px solid #f0f0f0" }}>
                        <div style={{ width: "100%", paddingBottom: "100%", position: "relative", background: "#f9f9f9" }}>
                          <img
                            src={rp.images?.[0]?.url || "/assets/img/product-images/1_1.jpg"}
                            alt={rp.name} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => { (e.target as HTMLImageElement).src = "/assets/img/product-images/1_1.jpg"; }}
                          />
                        </div>
                        <div style={{ padding: "12px" }}>
                          <h6 style={{ fontSize: "13px", color: "#333", fontWeight: "600", margin: "0 0 5px 0", WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {rp.name}
                          </h6>
                          <span style={{ color: "#F28C28", fontWeight: "700" }}>฿{parseFloat(rp.price).toLocaleString()}</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
