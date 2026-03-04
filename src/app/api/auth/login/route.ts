import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { queryOne } from '@/lib/db';
import { signJwt } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' }, { status: 400 });
    }

    // Since we're using "email" in frontend, we'll map that to username here. Let's use username field
    const admin = await queryOne('SELECT * FROM admin_users WHERE username = ? AND isActive = 1', [username]);

    if (!admin) {
      return NextResponse.json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      return NextResponse.json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const token = await signJwt({ id: admin.id, username: admin.username, role: admin.role, name: admin.name });

    const response = NextResponse.json({ success: true, user: { id: admin.id, name: admin.name, username: admin.username, role: admin.role } });
    
    // Set HTTP-only cookie
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดภายในระบบ: ' + error.message }, { status: 500 });
  }
}
