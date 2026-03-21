'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ComingSoonPage() {
  // Countdown to a target date (e.g., 30 days from now or a fixed date)
  const targetDate = new Date('2026-05-01T00:00:00+07:00').getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 4000);
    }
  };

  return (
    <div className="coming-soon-page">
      {/* Animated background particles */}
      <div className="cs-particles">
        {mounted && [...Array(20)].map((_, i) => (
          <div
            key={i}
            className="cs-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 8}s`,
              opacity: 0.15 + Math.random() * 0.25,
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
            }}
          />
        ))}
      </div>

      {/* Floating paw prints */}
      <div className="cs-paws">
        {mounted && [...Array(8)].map((_, i) => (
          <div
            key={i}
            className="cs-paw"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
              fontSize: `${16 + Math.random() * 24}px`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          >
            🐾
          </div>
        ))}
      </div>

      <div className="cs-content">
        {/* Logo */}
        <div className="cs-logo-wrapper">
          <div className="cs-logo-glow" />
          <Image
            src="/assets/img/logo/logo.png"
            alt="MeePro Pet Shop Logo"
            width={160}
            height={160}
            className="cs-logo"
            priority
          />
        </div>

        {/* Heading */}
        <div className="cs-heading">
          <span className="cs-badge">🚀 เร็วๆ นี้</span>
          <h1 className="cs-title">
            <span className="cs-title-gradient">MeePro Pet Shop</span>
          </h1>
          <p className="cs-subtitle">
            กำลังจะมาพร้อมประสบการณ์ใหม่ที่ดีกว่าเดิม!
          </p>
          <p className="cs-description">
            ร้านขายอาหารและอุปกรณ์สัตว์เลี้ยงออนไลน์ ครบครัน คุณภาพดี ราคาถูก
            <br />
            พร้อมบริการจัดส่งรวดเร็วถึงหน้าบ้าน
          </p>
        </div>

        {/* Countdown */}
        <div className="cs-countdown">
          <div className="cs-countdown-item">
            <div className="cs-countdown-card">
              <span className="cs-countdown-number">{String(timeLeft.days).padStart(2, '0')}</span>
            </div>
            <span className="cs-countdown-label">วัน</span>
          </div>
          <div className="cs-countdown-separator">:</div>
          <div className="cs-countdown-item">
            <div className="cs-countdown-card">
              <span className="cs-countdown-number">{String(timeLeft.hours).padStart(2, '0')}</span>
            </div>
            <span className="cs-countdown-label">ชั่วโมง</span>
          </div>
          <div className="cs-countdown-separator">:</div>
          <div className="cs-countdown-item">
            <div className="cs-countdown-card">
              <span className="cs-countdown-number">{String(timeLeft.minutes).padStart(2, '0')}</span>
            </div>
            <span className="cs-countdown-label">นาที</span>
          </div>
          <div className="cs-countdown-separator">:</div>
          <div className="cs-countdown-item">
            <div className="cs-countdown-card">
              <span className="cs-countdown-number">{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
            <span className="cs-countdown-label">วินาที</span>
          </div>
        </div>

        {/* Email Subscription */}
        <div className="cs-subscribe">
          <p className="cs-subscribe-text">📬 รับข่าวสารเมื่อเราเปิดให้บริการ</p>
          <form className="cs-subscribe-form" onSubmit={handleSubscribe}>
            <div className="cs-input-wrapper">
              <input
                type="email"
                placeholder="กรอกอีเมลของคุณ..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="cs-email-input"
                required
                id="coming-soon-email"
              />
              <button type="submit" className="cs-submit-btn" id="coming-soon-subscribe">
                <span>แจ้งเตือนฉัน</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>
          {isSubscribed && (
            <div className="cs-success-msg">
              ✅ ขอบคุณ! เราจะแจ้งเตือนคุณเมื่อเว็บไซต์พร้อมให้บริการ
            </div>
          )}
        </div>

        {/* Features Preview */}
        <div className="cs-features">
          <div className="cs-feature-card">
            <div className="cs-feature-icon">🐱</div>
            <h3>อาหารสัตว์เลี้ยง</h3>
            <p>อาหารคุณภาพ สำหรับน้องแมวและน้องหมา</p>
          </div>
          <div className="cs-feature-card">
            <div className="cs-feature-icon">🛒</div>
            <h3>สั่งซื้อง่าย</h3>
            <p>ระบบสั่งซื้อออนไลน์ สะดวก รวดเร็ว</p>
          </div>
          <div className="cs-feature-card">
            <div className="cs-feature-icon">🚚</div>
            <h3>จัดส่งทั่วไทย</h3>
            <p>จัดส่งรวดเร็ว ถึงหน้าบ้านคุณ</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="cs-contact">
          <h3 className="cs-contact-title">📞 ติดต่อเรา</h3>
          <div className="cs-contact-grid">
            <a href="tel:0812345678" className="cs-contact-item">
              <div className="cs-contact-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <span>081-234-5678</span>
            </a>
            <a href="https://line.me/ti/p/meepro" target="_blank" rel="noopener noreferrer" className="cs-contact-item">
              <div className="cs-contact-icon cs-contact-icon-line">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 5.82 2 10.5c0 3.26 2.16 6.12 5.39 7.67-.21.76-.77 2.76-.88 3.19-.14.54.2.53.42.39.17-.12 2.71-1.84 3.81-2.58.4.06.82.08 1.26.08 5.52 0 10-3.82 10-8.5S17.52 2 12 2z" />
                </svg>
              </div>
              <span>@meepro</span>
            </a>
            <a href="https://www.facebook.com/meepro" target="_blank" rel="noopener noreferrer" className="cs-contact-item">
              <div className="cs-contact-icon cs-contact-icon-fb">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </div>
              <span>MeePro Pet Shop</span>
            </a>
            <a href="mailto:contact@meepro.shop" className="cs-contact-item">
              <div className="cs-contact-icon cs-contact-icon-email">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 7l-10 7L2 7" />
                </svg>
              </div>
              <span>contact@meepro.shop</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="cs-footer">
          <p>© 2026 MeePro Pet Shop. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
