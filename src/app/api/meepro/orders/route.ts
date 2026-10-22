import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MP-${timestamp}${random}`;
}

class OutOfStockError extends Error {
  constructor(public item: any) {
    super('out of stock');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer,
      shippingAddress,
      items,
      paymentMethod,
      note,
      subtotal,
      shippingFee,
      discount,
      total,
    } = body;

    // Validate required fields
    if (!customer?.firstName || !customer?.phone || !items?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: customer name, phone, and items are required' },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      // Reserve stock: reject when a product/variant is sold out or insufficient
      for (const item of items) {
        const qty = Number(item.quantity);
        if (item.variantId) {
          const reserved = await tx.productVariant.updateMany({
            where: { id: item.variantId, productId: item.productId, isActive: true, stock: { gte: qty } },
            data: { stock: { decrement: qty } },
          });
          if (reserved.count === 0) throw new OutOfStockError(item);
          // Product stock mirrors the sum of its variants
          await tx.$executeRaw`UPDATE products SET stock = (SELECT COALESCE(SUM(stock), 0) FROM product_variants WHERE productId = ${item.productId} AND isActive = 1), salesCount = salesCount + ${qty} WHERE id = ${item.productId}`;
          continue;
        }
        const reservedProduct = await tx.product.updateMany({
          where: { id: item.productId, isActive: true, stock: { gte: qty } },
          data: { stock: { decrement: qty }, salesCount: { increment: qty } },
        });
        if (reservedProduct.count === 0) throw new OutOfStockError(item);
      }

      // Create or find customer
      let existingCustomer: any = null;
      if (customer.phone) {
        existingCustomer = await tx.customer.findFirst({
          where: { phone: customer.phone },
        });
      }

      const dbCustomer = existingCustomer
        ? await tx.customer.update({
            where: { id: existingCustomer.id },
            data: {
              firstName: customer.firstName,
              lastName: customer.lastName || '',
              email: customer.email || null,
            },
          })
        : await tx.customer.create({
            data: {
              firstName: customer.firstName,
              lastName: customer.lastName || '',
              email: customer.email || null,
              phone: customer.phone,
            },
          });

      // Create address
      const address = await tx.address.create({
        data: {
          customerId: dbCustomer.id,
          address: shippingAddress.address,
          subDistrict: shippingAddress.subDistrict || null,
          district: shippingAddress.district || null,
          province: shippingAddress.province || null,
          postalCode: shippingAddress.postalCode || null,
          phone: customer.phone,
        },
      });

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerId: dbCustomer.id,
          addressId: address.id,
          status: 'pending',
          paymentMethod: paymentMethod || 'transfer',
          paymentStatus: 'pending',
          subtotal,
          shippingFee: shippingFee || 0,
          discount: discount || 0,
          total,
          note: note || null,
          shippingName: `${customer.firstName} ${customer.lastName || ''}`.trim(),
          shippingAddress: `${shippingAddress.address} ${shippingAddress.subDistrict || ''} ${shippingAddress.district || ''} ${shippingAddress.province || ''} ${shippingAddress.postalCode || ''}`.trim(),
          shippingPhone: customer.phone,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              variantId: item.variantId || null,
              productName: item.productName,
              variantName: item.variantName || null,
              price: item.price,
              quantity: item.quantity,
              total: item.price * item.quantity,
            })),
          },
        },
        include: {
          items: true,
          customer: true,
        },
      });
      return order;
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof OutOfStockError) {
      const name = error.item.productName || `#${error.item.productId}`;
      return NextResponse.json(
        { error: `สินค้า "${name}" หมดหรือมีจำนวนไม่พอ กรุณาปรับจำนวนหรือนำออกจากตะกร้า`, code: 'OUT_OF_STOCK', productId: error.item.productId },
        { status: 409 }
      );
    }
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
