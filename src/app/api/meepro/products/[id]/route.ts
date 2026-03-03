import { NextResponse } from 'next/server';
import { staticProducts } from '@/lib/static-data';

let prisma: any = null;
try {
  prisma = require('@/lib/prisma').default;
} catch (e) {}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id);

  try {
    if (prisma) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: 'asc' } },
          variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        },
      });

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      const relatedProducts = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          isActive: true,
        },
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
        take: 4,
      });

      return NextResponse.json({ product, relatedProducts });
    }
  } catch (e) {
    // DB not available
  }

  // Static fallback
  const product = staticProducts.find(p => p.id === productId);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const relatedProducts = staticProducts
    .filter(p => p.category?.id === product.category?.id && p.id !== product.id)
    .slice(0, 4);

  return NextResponse.json({ product, relatedProducts });
}
