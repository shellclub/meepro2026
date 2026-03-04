"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
  _count?: { products: number };
}

// Emoji map for category slugs
const categoryEmojis: Record<string, string> = {
  "cat-food": "🐟",
  "cat-treats": "🍖",
  "cat-litter": "🧹",
  "cat-toys": "🐭",
  "grooming": "🧴",
  "cat-beds": "🛏️",
  "feeding": "🍽️",
};

function HeaderManu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/meepro/categories");
        const data = await res.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (e) {
        console.error("Failed to fetch categories:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <>
      <div className="gi-header-cat d-none d-lg-block">
        <div className="container position-relative">
          <div className="gi-nav-bar">
            {/* <!-- Category Toggle --> */}
            <div className="gi-category-icon-block">
              <div className="gi-category-menu">
                <div className="gi-category-toggle">
                  <i className="fi fi-rr-apps"></i>
                  <span className="text">หมวดหมู่ทั้งหมด</span>
                  <i
                    className="fi-rr-angle-small-down d-1199 gi-angle"
                    aria-hidden="true"
                  ></i>
                </div>
              </div>
              <div className="gi-cat-dropdown">
                <div className="gi-cat-block">
                  <div className="gi-cat-tab">
                    <div
                      className="gi-tab-list nav flex-column nav-pills me-3"
                      role="tablist"
                      aria-orientation="vertical"
                    >
                      {loading ? (
                        <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                          กำลังโหลดหมวดหมู่...
                        </div>
                      ) : (
                        categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/shop?category=${cat.slug}`}
                            className="nav-link"
                            style={{
                              padding: "12px 24px",
                              marginBottom: "4px",
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              fontSize: "14px",
                              color: "#333",
                              textDecoration: "none",
                              borderRadius: "6px",
                              transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              (e.target as HTMLElement).style.backgroundColor = "#fff5e6";
                              (e.target as HTMLElement).style.color = "#e8910c";
                            }}
                            onMouseLeave={(e) => {
                              (e.target as HTMLElement).style.backgroundColor = "transparent";
                              (e.target as HTMLElement).style.color = "#333";
                            }}
                          >
                            <span style={{ fontSize: "18px" }}>
                              {categoryEmojis[cat.slug] || "📦"}
                            </span>
                            <span>{cat.name}</span>
                            {cat._count && (
                              <span style={{
                                marginLeft: "auto",
                                fontSize: "12px",
                                color: "#999",
                                backgroundColor: "#f5f5f5",
                                padding: "2px 8px",
                                borderRadius: "10px",
                              }}>
                                {cat._count.products}
                              </span>
                            )}
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* <!-- Main Menu Start --> */}
            <div
              id="gi-main-menu-desk"
              className="d-none d-lg-block sticky-nav"
            >
              <div className="nav-desk">
                <div className="row">
                  <div className="col-md-12 align-self-center">
                    <div className="gi-main-menu">
                      <ul>
                        <li className="non-drop">
                          <Link href="/home">
                            หน้าแรก
                          </Link>
                        </li>
                        <li className="non-drop">
                          <Link href="/shop">
                            🛍️ สินค้าทั้งหมด
                          </Link>
                        </li>
                        <li className="dropdown drop-list">
                          <Link href="" className="dropdown-arrow">
                            หมวดหมู่<i className="fi-rr-angle-small-right"></i>
                          </Link>
                          <ul className="sub-menu">
                            {categories.map((cat) => (
                              <li key={cat.id}>
                                <Link href={`/shop?category=${cat.slug}`}>
                                  {categoryEmojis[cat.slug] || "📦"} {cat.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                        <li className="non-drop">
                          <Link href="/shop">
                            <i className="fi-rr-badge-percent"></i> โปรโมชั่น
                          </Link>
                        </li>
                        <li className="non-drop">
                          <Link href="/about-us">
                            เกี่ยวกับเรา
                          </Link>
                        </li>
                        <li className="non-drop">
                          <Link href="/contact-us">
                            ติดต่อเรา
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* <!-- Main Menu End --> */}
          </div>
        </div>
      </div>
    </>
  );
}

export default HeaderManu;
