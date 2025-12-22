import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);
        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Update the order
            const order = await tx.order.update({
                where: { id },
                data: { status },
                include: { master: true } // Include master to get percentage
            });

            // 2. If status is 'Готово' and master exists, calculate and create salary log
            if (status === 'Готово' && order.masterId && order.master) {
                // Check if log already exists to avoid duplicates
                const existingLog = await tx.salaryLog.findFirst({
                    where: { orderId: id }
                });

                if (!existingLog) {
                    const salaryAmount = order.price * (order.master.percentage / 100);

                    await tx.salaryLog.create({
                        data: {
                            amount: salaryAmount,
                            masterId: order.masterId,
                            orderId: id,
                            date: new Date(),
                            isPaid: false
                        }
                    });
                }
            }

            return order;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating order status:', error);
        return NextResponse.json(
            { error: 'Failed to update order status' },
            { status: 500 }
        );
    }
}
