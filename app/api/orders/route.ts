import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Автогенерация номера заказа
        const lastOrder = await prisma.order.findFirst({
            orderBy: { id: 'desc' },
        });
        const lastNum = lastOrder ? parseInt(lastOrder.orderNumber) : 0;
        const orderNumber = String(lastNum + 1);

        // Создание заказа с данными из формы
        const order = await prisma.order.create({
            data: {
                orderNumber,
                clientName: body.client || '',
                phone: body.phone || '',
                shoeType: body.shoeType || '',
                brand: body.brand || '',
                color: body.color || '',
                quantity: parseInt(body.shoeCount) || 1,
                services: Array.isArray(body.services) ? body.services.join(', ') : '',
                comment: body.comment || '',
                price: 0, // Будет заполнено позже
                masterPrice: 0,
                materialPrice: 0,
                prepaymentCash: 0,
                prepaymentTerminal: 0,
                status: 'Принят',
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
