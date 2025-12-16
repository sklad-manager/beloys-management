import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');

        let whereClause: any = {};

        if (search) {
            whereClause = {
                OR: [
                    { orderNumber: { contains: search, mode: 'insensitive' } },
                    { clientName: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } }
                ]
            };
        }

        const orders = await prisma.order.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: search ? 100 : 50, // Increase limit for search results
            include: { client: true }
        });

        // Ensure client info is present even if stored loosely
        const enrichedOrders = orders.map((order: any) => ({
            ...order,
            clientName: order.clientName || order.client?.name || 'Без имени',
            phone: order.phone || order.client?.phone || ''
        }));

        return NextResponse.json(enrichedOrders);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            description,
            clientName,
            phone,
            shoeType,
            brand,
            color,
            services,
            price,
            prepayment,
            paymentMethod,
            comment,
            clientId, // New field from frontend
            masterId,
            quantity
        } = body;

        // Find or Create Client logic
        let finalClientId = clientId;

        if (!finalClientId && phone) {
            // Try to find by phone
            const existingClient = await prisma.client.findUnique({
                where: { phone: phone }
            });

            if (existingClient) {
                finalClientId = existingClient.id;
            } else {
                // Create new client
                const newClient = await prisma.client.create({
                    data: {
                        name: clientName,
                        phone: phone,
                    }
                });
                finalClientId = newClient.id;
            }
        }

        // Генерация номера заказа (автоинкремент строки)
        // Get the latest order to determine the next order number
        const lastOrder = await prisma.order.findFirst({
            orderBy: {
                id: 'desc',
            },
        });

        let nextNumber = 1;
        if (lastOrder && lastOrder.orderNumber) {
            const parsed = parseInt(lastOrder.orderNumber, 10);
            if (!isNaN(parsed)) {
                nextNumber = parsed + 1;
            }
        }
        // Формат: простое число (1, 2, 3...)
        const orderNumber = nextNumber.toString();

        const newOrder = await prisma.order.create({
            data: {
                orderNumber,
                clientName,
                phone,
                client: finalClientId ? { connect: { id: finalClientId } } : undefined,
                master: masterId ? { connect: { id: Number(masterId) } } : undefined,
                shoeType: shoeType || 'Обувь',
                brand: brand || '',
                color: color || '',
                services: services || '',
                price: parseFloat(price),
                comment: comment || '',
                quantity: quantity ? parseInt(quantity) : 1,
                masterPrice: 0, // Assuming default values for these
                materialPrice: 0,
                paymentDate: null,
                status: 'Принят в работу',
                prepaymentCash: paymentMethod === 'Cash' ? (parseFloat(prepayment) || 0) : 0,
                prepaymentTerminal: paymentMethod === 'Terminal' ? (parseFloat(prepayment) || 0) : 0,
            },
        });

        return NextResponse.json(newOrder);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Ошибка создания заказа' }, { status: 500 });
    }
}
