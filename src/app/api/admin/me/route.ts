import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const admin = await getAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ user: admin });
}
