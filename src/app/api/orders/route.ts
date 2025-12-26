import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const view = searchParams.get('view'); // 'active' (default) | 'archive' | 'all'

        let whereClause: any = {};

        // 1. Status Filter
        if (view === 'archive') {
            whereClause.status = 'Выдан';
        } else if (view === 'all') {
            // No status filter
        } else {
            // Default: 'active' -> show everything EXCEPT 'Выдан'
            whereClause.status = { not: 'Выдан' };
        }

        // 2. Search Filter (AND logic)
        if (search) {
            whereClause.AND = [
                {
                    OR: [
                        { orderNumber: { contains: search, mode: 'insensitive' } },
                        { clientName: { contains: search, mode: 'insensitive' } },
                        { phone: { contains: search, mode: 'insensitive' } }
                    ]
                }
            ];
        }

        const orders = await prisma.order.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: search ? 100 : (view === 'archive' ? 50 : 100), // Limit results
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
            serviceDetails,
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

        // Robust Order Number Generation
        const allOrders = await prisma.order.findMany({ select: { orderNumber: true } });
        const maxVal = allOrders.reduce((max, curr) => {
            const n = parseInt(curr.orderNumber, 10);
            return isNaN(n) ? max : Math.max(max, n);
        }, 0);

        const nextNumber = maxVal + 1;
        const orderNumber = nextNumber.toString();

        const newOrder = await prisma.order.create({
            data: {
                orderNumber,
                clientName: clientName || 'Без имени',
                phone: phone || '',
                client: finalClientId ? { connect: { id: finalClientId } } : undefined,
                master: masterId ? { connect: { id: Number(masterId) } } : undefined,
                shoeType: shoeType || 'Обувь',
                brand: brand || '',
                color: color || '',
                services: services || '',
                serviceDetails: serviceDetails ? JSON.stringify(serviceDetails) : null,
                price: parseFloat(price) || 0,
                comment: comment || '',
                quantity: quantity ? parseInt(quantity) : 1,
                masterPrice: 0,
                materialPrice: 0,
                paymentDate: null,
                status: 'Принят в работу',
                prepaymentCash: paymentMethod === 'Cash' ? (parseFloat(prepayment) || 0) : 0,
                prepaymentTerminal: paymentMethod === 'Terminal' ? (parseFloat(prepayment) || 0) : 0,
            },
        });

        // Log the creation
        await prisma.systemLog.create({
            data: {
                type: 'ORDER',
                action: 'CREATE',
                targetId: orderNumber,
                details: `Создан новый заказ #${orderNumber} (${clientName})`,
                newData: JSON.stringify(newOrder),
                operator: 'Admin'
            }
        });

        return NextResponse.json(newOrder);
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({
            error: 'Ошибка создания заказа: ' + (error.message || 'Неизвестная ошибка сервера')
        }, { status: 500 });
    }
}
