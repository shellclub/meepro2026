import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyJwt } from '@/lib/jwt';

export type AdminSession = { id: number; username: string; role: string; name: string };

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return undefined;
}

export async function getAdmin(req: Request): Promise<AdminSession | null> {
  const token = readCookie(req, 'admin_token');
  if (!token) return null;
  const p: any = await verifyJwt(token);
  return p ? { id: Number(p.id), username: String(p.username), role: String(p.role), name: String(p.name || '') } : null;
}

/** Returns a 403 response unless the caller is a superadmin; null means allowed. */
export async function requireSuperadmin(req: Request): Promise<NextResponse | null> {
  const admin = await getAdmin(req);
  if (admin?.role === 'superadmin') return null;
  return NextResponse.json({ error: 'เฉพาะ superadmin เท่านั้น' }, { status: 403 });
}

const norm = (v: any) => (v === null || v === undefined || v === '' ? null : typeof v === 'boolean' ? (v ? 1 : 0) : isNaN(Number(v)) || typeof v === 'object' ? String(v) : Number(v));

/** Field-by-field diff of `before` vs `after` limited to `fields`; only changed fields are returned. */
export function diffFields(before: Record<string, any> | null, after: Record<string, any>, fields: string[]) {
  const out: Record<string, { from: any; to: any }> = {};
  for (const f of fields) {
    if (!(f in after)) continue;
    const a = norm(before?.[f]), b = norm(after[f]);
    if (a !== b) out[f] = { from: before?.[f] ?? null, to: after[f] ?? null };
  }
  return out;
}

type Entry = { action: string; entity: string; entityId?: string | number | null; summary: string; changes?: any };

/** Best-effort: a logging failure must never break the admin action itself. */
export async function logAudit(req: Request, entry: Entry, adminOverride?: { id?: number; username: string }) {
  try {
    const admin = adminOverride ?? (await getAdmin(req));
    const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '').split(',')[0].trim() || null;
    await execute(
      'INSERT INTO admin_audit_logs (adminId, username, action, entity, entityId, summary, changes, ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        admin?.id ?? null,
        admin?.username ?? 'unknown',
        entry.action,
        entry.entity,
        entry.entityId != null ? String(entry.entityId) : null,
        entry.summary.slice(0, 500),
        entry.changes ? JSON.stringify(entry.changes).slice(0, 60000) : null,
        ip,
      ]
    );
  } catch (e) {
    console.error('audit log failed', e);
  }
}

export const PRODUCT_FIELDS = ['name', 'slug', 'description', 'shortDesc', 'sku', 'price', 'comparePrice', 'costPrice', 'stock', 'weight', 'unit', 'isFeatured', 'isActive', 'status', 'categoryId', 'brandId', 'tags'];
