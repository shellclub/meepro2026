import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MP-${timestamp}${random}`;
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

    // Create or find customer
    let existingCustomer = null;
    if (customer.phone) {
      existingCustomer = await prisma.customer.findFirst({
        where: { phone: customer.phone },
      });
    }

    const dbCustomer = existingCustomer
      ? await prisma.customer.update({
          where: { id: existingCustomer.id },
          data: {
            firstName: customer.firstName,
            lastName: customer.lastName || '',
            email: customer.email || null,
          },
        })
      : await prisma.customer.create({
          data: {
            firstName: customer.firstName,
            lastName: customer.lastName || '',
            email: customer.email || null,
            phone: customer.phone,
          },
        });

    // Create address
    const address = await prisma.address.create({
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
    const order = await prisma.order.create({
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

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          salesCount: { increment: item.quantity },
        },
      });
    }

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
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
