import { NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { name, role, isActive, password } = body;
    const id = Number(params.id);

    // Prevent changing default super admin user (admin)
    const user = await queryOne('SELECT username FROM admin_users WHERE id = ?', [id]);
    if (!user) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้งาน' }, { status: 404 });
    }

    if (user.username === 'admin' && isActive === false) {
      return NextResponse.json({ error: 'ห้ามระงับบัญชีผู้ดูแลระบบหลัก' }, { status: 403 });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await execute('UPDATE admin_users SET name = ?, role = ?, isActive = ?, password = ?, updatedAt = NOW() WHERE id = ?', [
        name, role, isActive !== false ? 1 : 0, hashedPassword, id
      ]);
    } else {
      await execute('UPDATE admin_users SET name = ?, role = ?, isActive = ?, updatedAt = NOW() WHERE id = ?', [
        name, role, isActive !== false ? 1 : 0, id
      ]);
    }

    return NextResponse.json({ success: true, message: 'บันทึกข้อมูลสำเร็จ' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = Number(params.id);

    const user = await queryOne('SELECT username FROM admin_users WHERE id = ?', [id]);
    if (!user) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้งาน' }, { status: 404 });
    }

    if (user.username === 'admin') {
      return NextResponse.json({ error: 'ห้ามลบบัญชีผู้ดูแลระบบหลัก' }, { status: 403 });
    }

    await execute('DELETE FROM admin_users WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
