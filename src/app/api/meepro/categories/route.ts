import { NextResponse } from 'next/server';
import { staticCategories } from '@/lib/static-data';

let prisma: any = null;
try {
  prisma = require('@/lib/prisma').default;
} catch (e) {}

export async function GET() {
  try {
    if (prisma) {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { products: true } } },
      });
      return NextResponse.json({ categories });
    }
  } catch (e) {
    // DB not available
  }

  return NextResponse.json({ categories: staticCategories });
}
