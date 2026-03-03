"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { addItem } from "@/store/reducers/cartSlice";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// ==========================================
// Hero Slider Component
// ==========================================
function HeroSlider() {
  const slides = [
    {
      image: "/assets/img/banners/banner-1.jpg",
      title: "อาหารแมวคุณภาพ",
      subtitle: "ลดสูงสุด 30% สำหรับสมาชิก",
      btnText: "ช้อปเลย",
      btnLink: "/shop?category=cat-food",
    },
    {
      image: "/assets/img/banners/banner-2.jpg",
      title: "ของเล่นแมว มาใหม่!",
      subtitle: "สนุกสนานทั้งวัน สำหรับน้องเหมียว",
      btnText: "ดูสินค้า",
      btnLink: "/shop?category=cat-toys",
    },
    {
      image: "/assets/img/banners/banner-3.jpg",
      title: "ดูแลสุขภาพ น้องแมว",
      subtitle: "แชมพู ทรายแมว อุปกรณ์ครบครัน",
      btnText: "เลือกซื้อ",
      btnLink: "/shop?category=grooming",
    },
  ];

  return (
    <section className="gi-hero-section" style={{ marginBottom: "30px" }}>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="gi-hero-slider"
        style={{ borderRadius: "0" }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "500px",
                overflow: "hidden",
              }}
            >
              <img
                src={slide.image}
                alt={slide.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(to right, rgba(0,0,0,0.4) 0%, transparent 60%)",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 60px",
                }}
              >
                <div>
                  <h2
                    style={{
                      color: "#fff",
                      fontSize: "42px",
                      fontWeight: "700",
                      marginBottom: "10px",
                      textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                    }}
                  >
                    {slide.title}
                  </h2>
                  <p
                    style={{
                      color: "#fff",
                      fontSize: "18px",
                      marginBottom: "20px",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                    }}
                  >
                    {slide.subtitle}
                  </p>
                  <Link
                    href={slide.btnLink}
                    className="gi-btn-1"
                    style={{
                      display: "inline-block",
                      padding: "12px 30px",
                      fontSize: "16px",
                      borderRadius: "25px",
                      textDecoration: "none",
                    }}
                  >
                    {slide.btnText} →
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

// ==========================================
// Categories Section
// ==========================================
function CategoriesSection() {
  const categories = [
    { name: "อาหารแมว", slug: "cat-food", icon: "🐟", color: "#FF8C42" },
    { name: "ขนมแมว", slug: "cat-treats", icon: "🍖", color: "#FFD700" },
    { name: "ทรายแมว", slug: "cat-litter", icon: "🏖️", color: "#A0A0A0" },
    { name: "ของเล่นแมว", slug: "cat-toys", icon: "🐭", color: "#FF6B6B" },
    { name: "อุปกรณ์อาบน้ำ", slug: "grooming", icon: "🧴", color: "#4ECDC4" },
    { name: "ที่นอนแมว", slug: "cat-beds", icon: "🛏️", color: "#C9B1FF" },
    { name: "อุปกรณ์ให้อาหาร", slug: "feeding", icon: "🍽️", color: "#FF9A9E" },
  ];

  return (
    <section className="gi-category section-padding" style={{ padding: "40px 0" }}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="section-title" style={{ textAlign: "center", marginBottom: "30px" }}>
              <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#333" }}>
                🐱 หมวดหมู่สินค้า
              </h2>
              <p style={{ color: "#777", marginTop: "8px" }}>
                เลือกหมวดหมู่ที่คุณต้องการ
              </p>
            </div>
          </div>
        </div>
        <div className="row g-3 justify-content-center">
          {categories.map((cat, index) => (
            <div key={index} className="col-6 col-sm-4 col-md-3 col-lg" style={{ minWidth: "140px" }}>
              <Link href={`/shop?category=${cat.slug}`} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "25px 15px",
                    textAlign: "center",
                    border: "2px solid #f0f0f0",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  className="category-card"
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "#F28C28";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 25px rgba(242,140,40,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "#f0f0f0";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      fontSize: "40px",
                      marginBottom: "10px",
                      width: "70px",
                      height: "70px",
                      borderRadius: "50%",
                      background: `${cat.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px auto",
                    }}
                  >
                    {cat.icon}
                  </div>
                  <h6
                    style={{
                      color: "#333",
                      fontSize: "14px",
                      fontWeight: "600",
                      margin: 0,
                    }}
                  >
                    {cat.name}
                  </h6>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==========================================
// Product Card Component
// ==========================================
function ProductCard({ product }: { product: any }) {
  const dispatch = useDispatch();
  const mainImage = product.images?.[0]?.url || "/assets/img/product-images/1_1.jpg";
  const hoverImage = product.images?.[1]?.url || mainImage;

  const handleAddToCart = () => {
    dispatch(
      addItem({
        id: product.id,
        title: product.name,
        newPrice: parseFloat(product.price),
        oldPrice: parseFloat(product.comparePrice || product.price),
        image: mainImage,
        imageTwo: hoverImage,
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
    <div className="gi-product" style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #f0f0f0" }}>
      <div className="gi-pro-image" style={{ position: "relative", overflow: "hidden" }}>
        {discount > 0 && (
          <span
            className="meepro-badge-sale"
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              zIndex: 2,
              background: "#F28C28",
              color: "#fff",
              padding: "3px 10px",
              borderRadius: "15px",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            -{discount}%
          </span>
        )}
        <Link href={`/product/${product.id}`}>
          <div style={{ 
            width: "100%", 
            paddingBottom: "100%", 
            position: "relative",
            background: "#f9f9f9",
          }}>
            <img
              src={mainImage}
              alt={product.name}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "opacity 0.3s ease",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/assets/img/product-images/1_1.jpg";
              }}
            />
          </div>
        </Link>
        <div className="gi-pro-opt" style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          display: "flex",
          gap: "5px",
        }}>
          <button
            onClick={handleAddToCart}
            style={{
              background: "#F28C28",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              transition: "all 0.3s ease",
            }}
            title="เพิ่มลงตะกร้า"
          >
            🛒
          </button>
        </div>
      </div>
      <div className="gi-pro-content" style={{ padding: "15px" }}>
        {product.category && (
          <span style={{ fontSize: "11px", color: "#999", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {product.category.name}
          </span>
        )}
        <h6 style={{ margin: "5px 0 8px 0" }}>
          <Link
            href={`/product/${product.id}`}
            style={{
              color: "#333",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "600",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: "1.4",
            }}
          >
            {product.name}
          </Link>
        </h6>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "5px" }}>
          {[...Array(5)].map((_, i) => (
            <span key={i} style={{ color: i < Math.round(parseFloat(product.rating)) ? "#FFD700" : "#ddd", fontSize: "12px" }}>
              ★
            </span>
          ))}
          <span style={{ fontSize: "11px", color: "#999" }}>({product.reviewCount})</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#F28C28", fontWeight: "700", fontSize: "18px" }}>
            ฿{parseFloat(product.price).toLocaleString()}
          </span>
          {product.comparePrice && parseFloat(product.comparePrice) > parseFloat(product.price) && (
            <span style={{ color: "#999", textDecoration: "line-through", fontSize: "14px" }}>
              ฿{parseFloat(product.comparePrice).toLocaleString()}
            </span>
          )}
        </div>
        {product.weight && (
          <div style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>
            {product.weight}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// Featured Products Section
// ==========================================
function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/meepro/products?featured=true&limit=8")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section style={{ padding: "40px 0" }}>
        <div className="container text-center">
          <div className="spinner-border" style={{ color: "#F28C28" }} />
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: "40px 0", background: "#fff" }}>
      <div className="container">
        <div className="section-title" style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#333" }}>
            ⭐ สินค้าแนะนำ
          </h2>
          <p style={{ color: "#777", marginTop: "8px" }}>
            สินค้ายอดนิยม คุณภาพดี แมวชอบ
          </p>
        </div>
        <div className="row g-3">
          {products.map((product) => (
            <div key={product.id} className="col-6 col-md-4 col-lg-3">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <Link
            href="/shop"
            className="gi-btn-2"
            style={{
              display: "inline-block",
              padding: "12px 35px",
              borderRadius: "25px",
              textDecoration: "none",
              fontSize: "16px",
              border: "2px solid #F28C28",
              color: "#F28C28",
              fontWeight: "600",
              transition: "all 0.3s ease",
            }}
          >
            ดูสินค้าทั้งหมด →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// All Products Section
// ==========================================
function AllProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/meepro/products?limit=12&sort=popular")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section style={{ padding: "40px 0" }}>
        <div className="container text-center">
          <div className="spinner-border" style={{ color: "#F28C28" }} />
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: "40px 0", background: "#FFF8F0" }}>
      <div className="container">
        <div className="section-title" style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#333" }}>
            🛍️ สินค้าทั้งหมด
          </h2>
          <p style={{ color: "#777", marginTop: "8px" }}>
            สินค้าขายดี ราคาดีที่สุด
          </p>
        </div>
        <div className="row g-3">
          {products.map((product) => (
            <div key={product.id} className="col-6 col-md-4 col-lg-3">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <Link
            href="/shop"
            className="gi-btn-1"
            style={{
              display: "inline-block",
              padding: "12px 35px",
              borderRadius: "25px",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            ดูสินค้าเพิ่มเติม →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// Services Section
// ==========================================
function ServicesSection() {
  const services = [
    { icon: "🚚", title: "จัดส่งฟรี", desc: "สั่งซื้อครบ 500 บาท" },
    { icon: "🔄", title: "คืนสินค้าได้", desc: "ภายใน 7 วัน" },
    { icon: "✅", title: "สินค้าคุณภาพ", desc: "ของแท้ 100%" },
    { icon: "💬", title: "บริการลูกค้า", desc: "ตอบทุกคำถาม 24 ชม." },
  ];

  return (
    <section style={{ padding: "40px 0", background: "#fff" }}>
      <div className="container">
        <div className="row g-3">
          {services.map((svc, index) => (
            <div key={index} className="col-6 col-md-3">
              <div
                style={{
                  textAlign: "center",
                  padding: "25px 15px",
                  borderRadius: "12px",
                  border: "1px solid #f0f0f0",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 5px 15px rgba(242,140,40,0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>{svc.icon}</div>
                <h6 style={{ fontWeight: "600", color: "#333", fontSize: "15px" }}>{svc.title}</h6>
                <p style={{ color: "#999", fontSize: "13px", margin: 0 }}>{svc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==========================================
// Homepage
// ==========================================
export default function MeeProHomePage() {
  return (
    <>
      <HeroSlider />
      <CategoriesSection />
      <FeaturedProducts />
      <ServicesSection />
      <AllProducts />
    </>
  );
}
