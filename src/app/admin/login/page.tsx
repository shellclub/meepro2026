"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: formData.username, password: formData.password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        window.location.href = "/admin"; // Force reload to ensure middleware catches the new cookie properly
      } else {
        setError(data.error || 'เข้าสู่ระบบล้มเหลว');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          padding: 20px;
          font-family: 'Prompt', 'Sarabun', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .login-container::before {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(242, 140, 40, 0.2) 0%, rgba(0,0,0,0) 70%);
          top: -200px;
          left: -200px;
          border-radius: 50%;
        }

        .login-container::after {
          content: '';
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(0,0,0,0) 70%);
          bottom: -150px;
          right: -150px;
          border-radius: 50%;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 50px 40px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          z-index: 10;
          animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .brand-logo {
          font-size: 64px;
          line-height: 1;
          margin-bottom: 20px;
          display: inline-block;
          animation: bounce 2s infinite ease-in-out;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .login-title {
          font-size: 32px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .login-subtitle {
          font-size: 16px;
          color: #94a3b8;
          margin-bottom: 40px;
        }

        .input-group {
          position: relative;
          margin-bottom: 25px;
        }

        .input-group input {
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px 20px;
          font-size: 18px;
          color: #fff;
          outline: none;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .input-group input:focus {
          border-color: #F28C28;
          box-shadow: 0 0 0 4px rgba(242, 140, 40, 0.15);
          background: rgba(0, 0, 0, 0.3);
        }

        .input-group input::placeholder {
          color: transparent;
        }

        .input-group label {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
          color: #94a3b8;
          transition: all 0.3s ease;
          pointer-events: none;
        }

        .input-group input:focus + label,
        .input-group input:not(:placeholder-shown) + label {
          top: 0;
          transform: translateY(-50%) scale(0.85);
          left: 15px;
          background: #1e293b;
          padding: 0 8px;
          color: #F28C28;
          border-radius: 4px;
        }

        .login-btn {
          width: 100%;
          background: linear-gradient(135deg, #F28C28, #FF6B35);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 18px;
          font-size: 20px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 10px;
          font-family: inherit;
          box-shadow: 0 10px 20px -5px rgba(242, 140, 40, 0.4);
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 25px -5px rgba(242, 140, 40, 0.5);
        }

        .login-btn:active {
          transform: translateY(1px);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-msg {
          background: rgba(239, 68, 68, 0.1);
          border-left: 4px solid #ef4444;
          color: #fca5a5;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 25px;
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .back-link {
          display: block;
          text-align: center;
          margin-top: 30px;
          color: #94a3b8;
          text-decoration: none;
          font-size: 15px;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #fff;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 40px 24px;
          }
          .login-title {
            font-size: 28px;
          }
        }
      `}</style>

      <div className="login-container">
        <div className="login-card">
          <div style={{ textAlign: "center" }}>
            <span className="brand-logo">🐱</span>
            <h1 className="login-title">MeePro Admin</h1>
            <p className="login-subtitle">ระบบจัดการร้านค้าหลังบ้าน</p>
          </div>

          {error && (
            <div className="error-msg">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                id="username"
                placeholder="ชื่อผู้ใช้"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
              <label htmlFor="username">ชื่อผู้ใช้ (Username)</label>
            </div>

            <div className="input-group">
              <input
                type="password"
                id="password"
                placeholder="รหัสผ่าน"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <label htmlFor="password">รหัสผ่าน</label>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? <span className="spinner"></span> : "เข้าสู่ระบบ"}
            </button>
          </form>

          <Link href="/home" className="back-link">
            ← กลับหน้าเว็บไซต์
          </Link>
        </div>
      </div>
    </>
  );
}
