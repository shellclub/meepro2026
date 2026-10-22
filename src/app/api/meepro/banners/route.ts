import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ banners });
  } catch (e) {
    console.error('GET /api/meepro/banners failed', e);
    return NextResponse.json({ error: 'Failed to load banners', banners: [] }, { status: 500 });
  }
}
