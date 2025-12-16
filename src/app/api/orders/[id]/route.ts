import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id },
            include: { client: true }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const enrichedOrder = {
            ...order,
            clientName: order.clientName || order.client?.name || 'Без имени',
            phone: order.phone || order.client?.phone || ''
        };

        return NextResponse.json(enrichedOrder);
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);
        const data = await request.json();

        const {
            clientName,
            phone,
            shoeType,
            brand,
            color,
            quantity,
            services,
            price,
            comment,
            masterId,
            status
        } = data;

        // 1. Fetch current order to check edit count and get old data
        const currentOrder = await prisma.order.findUnique({
            where: { id },
            include: { client: true, master: true }
        });

        if (!currentOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (currentOrder.editCount >= 1) {
            // Allow admin override or specific logic if needed later, but strict for now
            return NextResponse.json({ error: 'Order can strictly be edited only once.' }, { status: 403 });
        }

        // Handle Client Logic (Find or Create)
        let clientId = undefined;
        if (phone) {
            const existingClient = await prisma.client.findUnique({
                where: { phone: phone }
            });

            if (existingClient) {
                clientId = existingClient.id;
            } else {
                const newClient = await prisma.client.create({
                    data: {
                        name: clientName || 'Без имени',
                        phone: phone,
                    }
                });
                clientId = newClient.id;
            }
        }

        // Prepare new data object for update
        const updateData = {
            clientName,
            phone,
            shoeType,
            brand,
            color,
            quantity: quantity ? parseInt(quantity) : undefined,
            services,
            price: parseFloat(price) || 0,
            comment,
            status,
            clientId: clientId,
            masterId: masterId ? Number(masterId) : undefined,
        };

        // Use transaction to ensure atomicity
        const [updatedOrder] = await prisma.$transaction([
            prisma.order.update({
                where: { id },
                data: {
                    ...updateData,
                    editCount: { increment: 1 }
                }
            }),
            prisma.orderEditLog.create({
                data: {
                    orderId: id,
                    oldData: JSON.stringify(currentOrder),
                    newData: JSON.stringify(updateData),
                    diff: `Edited via web UI`
                }
            })
        ]);

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);
        await prisma.order.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
