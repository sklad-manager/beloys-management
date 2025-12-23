import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const logs = await prisma.salaryLog.findMany({
            include: {
                master: true,
                // We can't include Order directly if it's not defined in schema relation properly on SalaryLog side?
                // Let's check schema. SalaryLog has orderId but NO relation field to Order defined in the provided schema view earlier? 
                // Wait, looking at schema.prisma provided earlier:
                // model SalaryLog { ... orderId Int? ... } but NO @relation to Order.
                // I should probably fix schema or just fetch manually. 
                // Actually, let's look at schema again. 
            },
            orderBy: {
                date: 'desc'
            }
        });

        // Since SalaryLog doesn't have a direct relation to Order in the schema provided earlier (it just had orderId Int?), 
        // we might need to fetch orders separately or just rely on IDs if we want to show order details.
        // Let's re-read schema.prisma from memory (or previous tool output).
        // Step 36 output: 
        // model SalaryLog { ... orderId Int? } 
        // It DOES NOT have `order Order @relation(...)`.
        // So I can't include it. 
        // I will return logs and fetch orders for them if needed, or just return basic info. 
        // BETTER APPROACH: Add the relation to schema first? The user didn't ask for schema change but it's cleaner. 
        // BUT the user said "don't go too fast". 
        // I'll stick to just fetching logs. I can manually fetch order numbers if needed, or just show Order ID.
        // Let's grab the order numbers in a second query or map them.

        // To minimize complexity without schema change:
        // I'll manually enrich the data with orderNumber if possible.

        const logsWithOrders = await Promise.all(logs.map(async (log) => {
            let orderNumber = '-';
            if (log.orderId) {
                const order = await prisma.order.findUnique({
                    where: { id: log.orderId },
                    select: { orderNumber: true }
                });
                if (order) orderNumber = order.orderNumber;
            }
            return {
                ...log,
                orderNumber
            };
        }));

        return NextResponse.json(logsWithOrders);
    } catch (error) {
        console.error('Error fetching salary logs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch salary logs' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const { logIds, masterId, amount, masterName } = await req.json();

        if (!logIds || !Array.isArray(logIds)) {
            return NextResponse.json({ error: 'Missing logIds' }, { status: 400 });
        }

        // 1. Mark logs as paid
        await prisma.salaryLog.updateMany({
            where: {
                id: { in: logIds }
            },
            data: {
                isPaid: true,
                paidAt: new Date()
            }
        });

        // 2. Create a cash transaction (Expense)
        await prisma.cashTransaction.create({
            data: {
                type: 'Expense',
                category: 'Master Salary',
                description: `Выплата зарплаты: ${masterName}`,
                amount: parseFloat(amount),
                method: 'Cash', // Defaulting to Cash for salary payouts
                relatedEntity: masterName,
                date: new Date()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking salary as paid:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
