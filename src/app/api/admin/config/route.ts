import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

export async function GET() {
  try {
    const configs = await query('SELECT * FROM site_configs ORDER BY `group` ASC, `key` ASC');
    return NextResponse.json({ configs });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const existing = await query('SELECT id FROM site_configs WHERE `key` = ?', [body.key]);
    if (existing.length > 0) {
      await execute('UPDATE site_configs SET value=?, `group`=? WHERE `key`=?', [body.value, body.group || 'general', body.key]);
    } else {
      await execute('INSERT INTO site_configs (`key`, value, `group`) VALUES (?, ?, ?)', [body.key, body.value, body.group || 'general']);
    }
    return NextResponse.json({ config: body });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    for (const item of body.configs) {
      const existing = await query('SELECT id FROM site_configs WHERE `key` = ?', [item.key]);
      if (existing.length > 0) {
        await execute('UPDATE site_configs SET value=?, `group`=? WHERE `key`=?', [item.value, item.group || 'general', item.key]);
      } else {
        await execute('INSERT INTO site_configs (`key`, value, `group`) VALUES (?, ?, ?)', [item.key, item.value, item.group || 'general']);
      }
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
