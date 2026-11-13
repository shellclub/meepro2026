import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireSuperadmin } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const denied = await requireSuperadmin(request);
  if (denied) return denied;
  const sp = new URL(request.url).searchParams;
  const page = Math.max(1, parseInt(sp.get('page') || '1') || 1);
  const limit = Math.min(100, Math.max(1, parseInt(sp.get('limit') || '50') || 50));
  const where: string[] = []; const params: any[] = [];
  for (const k of ['username', 'entity', 'action'] as const) {
    if (sp.get(k)) { where.push(`${k} = ?`); params.push(sp.get(k)); }
  }
  if (sp.get('q')) { where.push('(summary LIKE ? OR entityId = ?)'); params.push(`%${sp.get('q')}%`, sp.get('q')); }
  if (sp.get('from')) { where.push('createdAt >= ?'); params.push(sp.get('from')); }
  if (sp.get('to')) { where.push('createdAt < DATE_ADD(?, INTERVAL 1 DAY)'); params.push(sp.get('to')); }
  const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
  try {
    const [{ c }] = await query(`SELECT COUNT(*) AS c FROM admin_audit_logs ${w}`, params);
    const logs = await query(`SELECT * FROM admin_audit_logs ${w} ORDER BY id DESC LIMIT ? OFFSET ?`, [...params, limit, (page - 1) * limit]);
    const users = await query('SELECT DISTINCT username FROM admin_audit_logs ORDER BY username');
    return NextResponse.json({ logs, users: users.map((u: any) => u.username), pagination: { page, limit, total: Number(c), totalPages: Math.ceil(Number(c) / limit) } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
