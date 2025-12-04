import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Generate order number if not provided
        let orderNumber = body.orderNumber;
        if (!orderNumber) {
            const lastOrder = await prisma.order.findFirst({
                orderBy: { id: 'desc' },
            });
            const lastNum = lastOrder ? parseInt(lastOrder.orderNumber) : 0;
            orderNumber = String(lastNum + 1).padStart(6, '0');
        }

        // Handle prepayment based on payment method
        const prepaymentCash = body.paymentMethod === 'cash' ? body.prepayment : 0;
        const prepaymentTerminal = body.paymentMethod === 'terminal' ? body.prepayment : 0;

        const order = await prisma.order.create({
            data: {
                orderNumber,
                clientName: body.clientName,
                phone: body.phone,
                shoeType: body.shoeType,
                brand: body.brand,
                color: body.color,
                quantity: body.quantity,
                services: body.services,
                comment: body.comment || '',
                price: body.price,
                masterPrice: body.masterPrice,
                materialPrice: body.materialPrice,
                prepaymentCash,
                prepaymentTerminal,
                masterId: body.masterId,
                status: body.status,
            },
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Error creating order' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: { master: true },
        });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching orders' }, { status: 500 });
    }
}
