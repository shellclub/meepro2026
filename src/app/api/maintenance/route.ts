import { NextResponse } from 'next/server';
import { getMaintenanceStatus } from '@/lib/maintenance';

export const dynamic = 'force-dynamic';

// Public: used by middleware to decide whether to show the maintenance page
export async function GET() {
  try {
    return NextResponse.json(await getMaintenanceStatus());
  } catch {
    return NextResponse.json({ enabled: false, message: '' });
  }
}
