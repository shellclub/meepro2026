import { getMaintenanceStatus, DEFAULT_MAINTENANCE_MESSAGE } from '@/lib/maintenance';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'MeePro Pet Shop - ปิดปรับปรุง', robots: { index: false } };

export default async function MaintenancePage() {
  let message = DEFAULT_MAINTENANCE_MESSAGE;
  try { message = (await getMaintenanceStatus()).message; } catch {}

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'linear-gradient(135deg,#1e1b3a,#3b2a5a)', color: '#fff', textAlign: 'center' }}>
      <div style={{ maxWidth: 520 }}>
        <div style={{ fontSize: 72, marginBottom: 12 }}>🐾🛠️</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 12px' }}>MeePro Pet Shop</h1>
        <h2 style={{ fontSize: 22, fontWeight: 500, margin: '0 0 20px', color: '#F28C28' }}>ปิดปรับปรุงชั่วคราว</h2>
        <p style={{ fontSize: 16, lineHeight: 1.7, opacity: 0.85, whiteSpace: 'pre-line' }}>{message}</p>
      </div>
    </div>
  );
}
