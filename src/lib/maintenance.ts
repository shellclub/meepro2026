import { query } from '@/lib/db';

export const DEFAULT_MAINTENANCE_MESSAGE =
  'ขณะนี้เว็บไซต์กำลังปิดปรับปรุงชั่วคราว ขออภัยในความไม่สะดวก กรุณากลับมาใหม่อีกครั้งในภายหลัง';

export async function getMaintenanceStatus(): Promise<{ enabled: boolean; message: string }> {
  const rows = await query(
    "SELECT `key`, value FROM site_configs WHERE `key` IN ('maintenance_enabled', 'maintenance_message')"
  );
  const map: Record<string, string> = {};
  rows.forEach((r: any) => { map[r.key] = r.value; });
  return {
    enabled: map.maintenance_enabled === '1',
    message: map.maintenance_message?.trim() || DEFAULT_MAINTENANCE_MESSAGE,
  };
}
