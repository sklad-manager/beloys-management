import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Генерация номера заказа (автоинкремент строки)
        const lastOrder = await prisma.order.findFirst({
            orderBy: { id: 'desc' },
        });

        let nextNumber = 1;
        if (lastOrder && lastOrder.orderNumber) {
            const parsed = parseInt(lastOrder.orderNumber, 10);
            if (!isNaN(parsed)) {
                nextNumber = parsed + 1;
            }
        }
        // Формат 000001
        const orderNumber = nextNumber.toString().padStart(6, '0');

        const newOrder = await prisma.order.create({
            data: {
                orderNumber,
                clientName: body.clientName,
                phone: body.phone,
                shoeType: body.shoeType || 'Обувь',
                brand: body.brand || '',
                color: body.color || '',
                quantity: parseInt(body.quantity) || 1,
                services: body.services || '',
                comment: body.comment || '',
                price: parseFloat(body.price) || 0,
                masterPrice: 0,
                materialPrice: 0,
                paymentDate: null,
                // Простая логика предоплаты
                prepaymentCash: body.paymentMethod === 'Cash' ? (parseFloat(body.prepayment) || 0) : 0,
                prepaymentTerminal: body.paymentMethod === 'Terminal' ? (parseFloat(body.prepayment) || 0) : 0,
                status: 'Принят в работу'
            }
        });

        return NextResponse.json(newOrder);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Ошибка создания заказа' }, { status: 500 });
    }
}
