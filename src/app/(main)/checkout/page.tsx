"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { clearCart } from "@/store/reducers/cartSlice";
import Link from "next/link";

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("transfer");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    subDistrict: "",
    district: "",
    province: "",
    postalCode: "",
    note: "",
  });

  const subtotal = cartItems.reduce((sum: number, item: any) => sum + item.newPrice * item.quantity, 0);
  const shippingFee = subtotal >= 500 ? 0 : 50;
  const total = subtotal + shippingFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.phone || !form.address) {
      alert("กรุณากรอกชื่อ เบอร์โทร และที่อยู่");
      return;
    }
    if (cartItems.length === 0) {
      alert("ตะกร้าสินค้าว่าง");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/meepro/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
          },
          shippingAddress: {
            address: form.address,
            subDistrict: form.subDistrict,
            district: form.district,
            province: form.province,
            postalCode: form.postalCode,
          },
          items: cartItems.map((item: any) => ({
            productId: item.id,
            productName: item.title,
            price: item.newPrice,
            quantity: item.quantity,
          })),
          paymentMethod,
          note: form.note,
          subtotal,
          shippingFee,
          discount: 0,
          total,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderNumber(data.order.orderNumber);
        setSuccess(true);
        dispatch(clearCart());
      } else {
        alert("เกิดข้อผิดพลาด: " + (data.error || "ไม่สามารถสร้างคำสั่งซื้อได้"));
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <section style={{ padding: "60px 0" }}>
        <div className="container">
          <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center", padding: "40px", background: "#fff", borderRadius: "16px", border: "1px solid #f0f0f0" }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🎉</div>
            <h2 style={{ color: "#28A745", fontWeight: "700", marginBottom: "15px" }}>สั่งซื้อสำเร็จ!</h2>
            <p style={{ color: "#666", fontSize: "16px", marginBottom: "10px" }}>ขอบคุณสำหรับการสั่งซื้อ</p>
            <div style={{ background: "#FFF8F0", borderRadius: "10px", padding: "20px", margin: "20px 0" }}>
              <p style={{ margin: 0, color: "#333" }}>หมายเลขคำสั่งซื้อ</p>
              <h3 style={{ color: "#F28C28", fontWeight: "700", margin: "5px 0" }}>{orderNumber}</h3>
            </div>
            <p style={{ color: "#666", fontSize: "14px" }}>
              {paymentMethod === "transfer"
                ? "กรุณาโอนเงินตามรายละเอียดที่แจ้ง และส่งสลิปมาทาง LINE: @meepropetshop"
                : "เราจะจัดส่งสินค้าให้ท่านเร็วที่สุด ชำระเงินปลายทาง"}
            </p>
            <div style={{ marginTop: "25px", display: "flex", gap: "10px", justifyContent: "center" }}>
              <Link href="/home" style={{ display: "inline-block", padding: "12px 25px", borderRadius: "25px", background: "#F28C28", color: "#fff", textDecoration: "none", fontWeight: "600" }}>
                กลับหน้าแรก
              </Link>
              <Link href="/shop" style={{ display: "inline-block", padding: "12px 25px", borderRadius: "25px", border: "2px solid #F28C28", color: "#F28C28", textDecoration: "none", fontWeight: "600" }}>
                ช้อปต่อ
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (cartItems.length === 0) {
    return (
      <section style={{ padding: "60px 0", textAlign: "center" }}>
        <div className="container">
          <div style={{ fontSize: "64px", marginBottom: "15px" }}>🛒</div>
          <h3 style={{ color: "#333" }}>ตะกร้าสินค้าว่าง</h3>
          <p style={{ color: "#666" }}>กรุณาเลือกสินค้าก่อนชำระเงิน</p>
          <Link href="/shop" style={{ display: "inline-block", padding: "12px 30px", borderRadius: "25px", background: "#F28C28", color: "#fff", textDecoration: "none", fontWeight: "600", marginTop: "15px" }}>
            ไปเลือกสินค้า
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ background: "linear-gradient(135deg, #FFF8F0, #FFF3E0)", padding: "20px 0" }}>
        <div className="container">
          <nav>
            <ol className="breadcrumb" style={{ margin: 0, background: "none" }}>
              <li className="breadcrumb-item"><Link href="/home" style={{ color: "#F28C28", textDecoration: "none" }}>หน้าแรก</Link></li>
              <li className="breadcrumb-item"><Link href="/cart" style={{ color: "#F28C28", textDecoration: "none" }}>ตะกร้า</Link></li>
              <li className="breadcrumb-item active" style={{ color: "#666" }}>ชำระเงิน</li>
            </ol>
          </nav>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#333", marginTop: "10px" }}>💳 ชำระเงิน</h1>
        </div>
      </div>

      <section style={{ padding: "30px 0" }}>
        <div className="container">
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Customer Info */}
              <div className="col-lg-7" style={{ marginBottom: "20px" }}>
                <div style={{ background: "#fff", borderRadius: "12px", padding: "25px", border: "1px solid #f0f0f0", marginBottom: "20px" }}>
                  <h5 style={{ fontWeight: "700", marginBottom: "20px", color: "#333" }}>📝 ข้อมูลผู้สั่งซื้อ</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label style={{ fontSize: "13px", color: "#666", marginBottom: "5px", display: "block" }}>ชื่อ *</label>
                      <input name="firstName" value={form.firstName} onChange={handleChange} required
                        style={{ width: "100%", padding: "10px 15px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }} />
                    </div>
                    <div className="col-md-6">
                      <label style={{ fontSize: "13px", color: "#666", marginBottom: "5px", display: "block" }}>นามสกุล</label>
                      <input name="lastName" value={form.lastName} onChange={handleChange}
                        style={{ width: "100%", padding: "10px 15px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }} />
                    </div>
                    <div className="col-md-6">
                      <label style={{ fontSize: "13px", color: "#666", marginBottom: "5px", display: "block" }}>เบอร์โทร *</label>
                      <input name="phone" value={form.phone} onChange={handleChange} required type="tel"
                        style={{ width: "100%", padding: "10px 15px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }} />
                    </div>
                    <div className="col-md-6">
                      <label style={{ fontSize: "13px", color: "#666", marginBottom: "5px", display: "block" }}>อีเมล</label>
                      <input name="email" value={form.email} onChange={handleChange} type="email"
                        style={{ width: "100%", padding: "10px 15px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }} />
                    </div>
                  </div>
                </div>

                <div style={{ background: "#fff", borderRadius: "12px", padding: "25px", border: "1px solid #f0f0f0", marginBottom: "20px" }}>
                  <h5 style={{ fontWeight: "700", marginBottom: "20px", color: "#333" }}>📦 ข้อมูลจัดส่ง</h5>
                  <div className="row g-3">
                    <div className="col-12">
                      <label style={{ fontSize: "13px", color: "#666", marginBottom: "5px", display: "block" }}>ที่อยู่ *</label>
                      <textarea name="address" value={form.address} onChange={handleChange} required rows={2}
                        style={{ width: "100%", padding: "10px 15px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", resize: "none" }} />
                    </div>
                    <div className="col-md-6">
                      <label style={{ fontSize: "13px", color: "#666", marginBottom: "5px", display: "block" }}>ตำบล/แขวง</label>
                      <input name="subDistrict" value={form.subDistrict} onChange={handleChange}
                        style={{ width: "100%", padding: "10px 15px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }} />
                    </div>
                    <div className="col-md-6">
                      <label style={{ fontSize: "13px", color: "#666", marginBottom: "5px", display: "block" }}>อำเภอ/เขต</label>
                      <input name="district" value={form.district} onChange={handleChange}
                        style={{ width: "100%", padding: "10px 15px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }} />
                    </div>
                    <div className="col-md-6">
                      <label style={{ fontSize: "13px", color: "#666", marginBottom: "5px", display: "block" }}>จังหวัด</label>
                      <input name="province" value={form.province} onChange={handleChange}
                        style={{ width: "100%", padding: "10px 15px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }} />
                    </div>
                    <div className="col-md-6">
                      <label style={{ fontSize: "13px", color: "#666", marginBottom: "5px", display: "block" }}>รหัสไปรษณีย์</label>
                      <input name="postalCode" value={form.postalCode} onChange={handleChange}
                        style={{ width: "100%", padding: "10px 15px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }} />
                    </div>
                    <div className="col-12">
                      <label style={{ fontSize: "13px", color: "#666", marginBottom: "5px", display: "block" }}>หมายเหตุ</label>
                      <textarea name="note" value={form.note} onChange={handleChange} rows={2}
                        style={{ width: "100%", padding: "10px 15px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", resize: "none" }}
                        placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)" />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div style={{ background: "#fff", borderRadius: "12px", padding: "25px", border: "1px solid #f0f0f0" }}>
                  <h5 style={{ fontWeight: "700", marginBottom: "20px", color: "#333" }}>💰 วิธีชำระเงิน</h5>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "15px", borderRadius: "8px", border: paymentMethod === "transfer" ? "2px solid #F28C28" : "1px solid #ddd", background: paymentMethod === "transfer" ? "#FFF8F0" : "#fff", cursor: "pointer" }}>
                      <input type="radio" name="payment" value="transfer" checked={paymentMethod === "transfer"} onChange={(e) => setPaymentMethod(e.target.value)} />
                      <div>
                        <strong style={{ color: "#333" }}>🏦 โอนเงิน / พร้อมเพย์</strong>
                        <p style={{ margin: 0, color: "#999", fontSize: "12px" }}>โอนเงินแล้วส่งสลิปทาง LINE</p>
                      </div>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "15px", borderRadius: "8px", border: paymentMethod === "cod" ? "2px solid #F28C28" : "1px solid #ddd", background: paymentMethod === "cod" ? "#FFF8F0" : "#fff", cursor: "pointer" }}>
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={(e) => setPaymentMethod(e.target.value)} />
                      <div>
                        <strong style={{ color: "#333" }}>📦 เก็บเงินปลายทาง (COD)</strong>
                        <p style={{ margin: 0, color: "#999", fontSize: "12px" }}>ชำระเงินเมื่อได้รับสินค้า</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="col-lg-5">
                <div style={{ background: "#fff", borderRadius: "12px", padding: "25px", border: "1px solid #f0f0f0", position: "sticky", top: "20px" }}>
                  <h5 style={{ fontWeight: "700", marginBottom: "20px", color: "#333" }}>📋 สรุปคำสั่งซื้อ</h5>
                  
                  {cartItems.map((item: any, i: number) => (
                    <div key={i} style={{ display: "flex", gap: "12px", padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
                      <img src={item.image} alt={item.title}
                        style={{ width: "60px", height: "60px", borderRadius: "8px", objectFit: "cover" }}
                        onError={(e) => { (e.target as HTMLImageElement).src = "/assets/img/product-images/1_1.jpg"; }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: "500", color: "#333" }}>{item.title}</p>
                        <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#999" }}>x{item.quantity}</p>
                      </div>
                      <span style={{ fontWeight: "600", color: "#F28C28", fontSize: "14px", whiteSpace: "nowrap" }}>
                        ฿{(item.newPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}

                  <div style={{ margin: "15px 0", padding: "15px 0", borderTop: "1px solid #eee" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                      <span style={{ color: "#666" }}>ราคาสินค้า</span>
                      <span style={{ color: "#333" }}>฿{subtotal.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                      <span style={{ color: "#666" }}>ค่าจัดส่ง</span>
                      <span style={{ color: shippingFee === 0 ? "#28A745" : "#333" }}>
                        {shippingFee === 0 ? "ฟรี!" : `฿${shippingFee}`}
                      </span>
                    </div>
                    {shippingFee > 0 && (
                      <p style={{ fontSize: "11px", color: "#F28C28", margin: "0 0 8px" }}>
                        * สั่งซื้อครบ ฿500 จัดส่งฟรี!
                      </p>
                    )}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", padding: "15px 0", borderTop: "2px solid #eee", marginBottom: "20px" }}>
                    <span style={{ fontWeight: "700", fontSize: "18px", color: "#333" }}>รวมทั้งหมด</span>
                    <span style={{ fontWeight: "700", fontSize: "24px", color: "#F28C28" }}>฿{total.toLocaleString()}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: "100%", padding: "15px", borderRadius: "25px",
                      background: loading ? "#ccc" : "#F28C28",
                      color: "#fff", border: "none", fontSize: "18px", fontWeight: "700",
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "กำลังดำเนินการ..." : "✅ ยืนยันคำสั่งซื้อ"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
