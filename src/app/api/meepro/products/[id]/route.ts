import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id);
  if (Number.isNaN(productId)) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { isActive: true }, orderBy: { id: 'asc' } },
      },
    });

    if (!product || !product.isActive || product.status === 'discontinued') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
        status: { not: 'discontinued' },
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
      take: 4,
    });

    return NextResponse.json({
      product: product.stock > 0 ? product : { ...product, status: 'out_of_stock' },
      relatedProducts,
    });
  } catch (e) {
    console.error('GET /api/meepro/products/[id] failed', e);
    return NextResponse.json({ error: 'Failed to load product' }, { status: 500 });
  }
}
