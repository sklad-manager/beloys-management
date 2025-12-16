
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);
        const { paymentAmount, paymentMethod } = await request.json();

        // Validate inputs
        if (!paymentMethod || !['Cash', 'Terminal'].includes(paymentMethod)) {
            return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
        }

        const amount = parseFloat(paymentAmount) || 0;

        // Fetch current order to get details for transaction description
        const currentOrder = await prisma.order.findUnique({
            where: { id },
            include: { client: true } // Need client name for transaction
        });

        if (!currentOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Prepare updates
        const updateData: any = {
            status: 'Выдан',
            completedAt: new Date(),
            paymentDate: new Date(),
        };

        if (paymentMethod === 'Cash') {
            updateData.paymentFullCash = amount;
        } else {
            updateData.paymentFullTerminal = amount;
        }

        // Execute Transaction
        const [updatedOrder, transaction] = await prisma.$transaction([
            // 1. Update Order
            prisma.order.update({
                where: { id },
                data: updateData
            }),
            // 2. Create Cash Transaction (Income)
            prisma.cashTransaction.create({
                data: {
                    type: 'Income',
                    category: 'Client Payment', // As defined in schema comment
                    description: `Оплата заказа #${currentOrder.orderNumber}`,
                    amount: amount,
                    method: paymentMethod,
                    relatedEntity: currentOrder.clientName || 'Клиент',
                    date: new Date()
                }
            })
        ]);

        return NextResponse.json({ success: true, order: updatedOrder });

    } catch (error) {
        console.error('Error completing order:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
