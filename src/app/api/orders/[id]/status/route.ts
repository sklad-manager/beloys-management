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

            // 2. If status is 'Готово', calculate and create salary log(s)
            if (status === 'Готово') {
                // Check if logs already exist to avoid duplicates
                const existingLogs = await tx.salaryLog.findMany({
                    where: { orderId: id }
                });

                if (existingLogs.length === 0) {
                    if (order.serviceDetails) {
                        try {
                            const details = JSON.parse(order.serviceDetails);
                            // Group by master
                            const masterPortions: Record<number, number> = {};

                            for (const item of details) {
                                let mId = item.masterId;

                                // Robust check: if ID is missing but name is present, try to find in DB
                                if (!mId && item.masterName) {
                                    const foundMaster = await tx.master.findFirst({
                                        where: { name: { equals: item.masterName, mode: 'insensitive' } }
                                    });
                                    if (foundMaster) mId = foundMaster.id;
                                }

                                if (mId) {
                                    const price = parseFloat(item.price) || 0;
                                    masterPortions[mId] = (masterPortions[mId] || 0) + price;
                                }
                            }

                            // Create logs for each master
                            for (const [mId, portion] of Object.entries(masterPortions)) {
                                const master = await tx.master.findUnique({
                                    where: { id: parseInt(mId) }
                                });
                                if (master) {
                                    const salaryAmount = portion * (master.percentage / 100);
                                    await tx.salaryLog.create({
                                        data: {
                                            amount: salaryAmount,
                                            masterId: parseInt(mId),
                                            orderId: id,
                                            date: new Date(),
                                            isPaid: false
                                        }
                                    });
                                }
                            }
                        } catch (e) {
                            console.error('Failed to parse serviceDetails during salary calculation', e);
                            // Fallback to single master if parsing fails
                            if (order.masterId && order.master) {
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
                    } else if (order.masterId && order.master) {
                        // Old logic fallback
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
