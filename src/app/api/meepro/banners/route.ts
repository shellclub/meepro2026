import { NextResponse } from 'next/server';
import { staticBanners } from '@/lib/static-data';

let prisma: any = null;
try {
  prisma = require('@/lib/prisma').default;
} catch (e) {}

export async function GET() {
  try {
    if (prisma) {
      const banners = await prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
      return NextResponse.json({ banners });
    }
  } catch (e) {
    // DB not available
  }

  return NextResponse.json({ banners: staticBanners });
}
