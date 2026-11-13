import { NextResponse } from 'next/server';
import { query, execute, queryOne } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { logAudit, requireSuperadmin } from '@/lib/audit';

export async function GET(request: Request) {
  const denied = await requireSuperadmin(request);
  if (denied) return denied;
  try {
    const users = await query('SELECT id, username, name, role, isActive, createdAt, updatedAt FROM admin_users ORDER BY id ASC');
    return NextResponse.json({ users });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireSuperadmin(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    const { username, password, name, role, isActive } = body;

    const existingUser = await queryOne('SELECT id FROM admin_users WHERE username = ?', [username]);
    if (existingUser) {
      return NextResponse.json({ error: 'มีชื่อผู้ใช้นี้ในระบบแล้ว' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await execute(
      'INSERT INTO admin_users (username, password, name, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [username, hashedPassword, name, role || 'admin', isActive !== false ? 1 : 0]
    );

    await logAudit(request, { action: 'create', entity: 'user', entityId: Number(result.insertId), summary: `สร้างผู้ใช้ ${username} (role: ${role || 'admin'})` });
    return NextResponse.json({ success: true, user: { id: Number(result.insertId), username, name, role } }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
