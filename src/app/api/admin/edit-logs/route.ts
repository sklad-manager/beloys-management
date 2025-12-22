import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// Временно отключено - таблица OrderEditLog не существует в базе данных
export async function GET() {
    return NextResponse.json([]);

    /* try {
        const logs = await prisma.orderEditLog.findMany({
            orderBy: { changedAt: 'desc' },
            include: {
                order: {
                    select: { orderNumber: true }
                }
            }
        });

        // Format for UI
        const formattedLogs = logs.map(log => ({
            id: log.id,
            orderId: log.orderId,
            orderNumber: log.order.orderNumber,
            oldData: JSON.parse(log.oldData),
            newData: JSON.parse(log.newData),
            diff: log.diff,
            date: log.changedAt
        }));

        return NextResponse.json(formattedLogs);
    } catch (error) {
        console.error('Error fetching edit logs:', error);
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    } */
}
