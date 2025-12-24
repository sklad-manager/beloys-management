import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get('year') || '0');
    const month = parseInt(searchParams.get('month') || '0');

    if (!year || !month) return NextResponse.json({ error: 'Year and Month required' }, { status: 400 });

    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);

        // 1. Orders
        const monthOrders = await prisma.order.findMany({
            where: {
                createdAt: { gte: startDate, lt: endDate }
            }
        });

        const acceptedOrders = monthOrders.filter(o => o.status === 'Принят в работу');
        const readyOrders = monthOrders.filter(o => o.status === 'Готово');
        const archivedOrders = monthOrders.filter(o => o.status === 'Выдан');

        // 2. Master Salaries
        const masterLogs = await prisma.salaryLog.findMany({
            where: {
                date: { gte: startDate, lt: endDate }
            }
        });
        const masterPaid = masterLogs.filter(l => l.isPaid).reduce((sum, l) => sum + l.amount, 0);
        const masterDebt = masterLogs.filter(l => !l.isPaid).reduce((sum, l) => sum + l.amount, 0);

        // 3. Staff Salaries
        const staffShifts = await prisma.staffShift.findMany({
            where: {
                date: { gte: startDate, lt: endDate }
            }
        });
        const staffPaid = staffShifts.filter(s => s.isPaid).reduce((sum: number, s: any) => sum + s.amount, 0);
        const staffDebt = staffShifts.filter(s => !s.isPaid).reduce((sum: number, s: any) => sum + s.amount, 0);

        // 4. Actual Expenses
        const actualExpenses = await prisma.expense.findMany({
            where: {
                date: { gte: startDate, lt: endDate }
            }
        });
        const totalActualExpenses = actualExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);

        // 5. Fixed Costs (Planned)
        const fixedCosts = await prisma.fixedCost.findMany({
            where: { year, month }
        });
        const totalFixedCosts = fixedCosts.reduce((sum: number, c: any) => sum + c.amount, 0);

        return NextResponse.json({
            orders: {
                totalCount: monthOrders.length,
                totalSum: monthOrders.reduce((sum, o) => sum + o.price, 0),
                acceptedCount: acceptedOrders.length,
                acceptedSum: acceptedOrders.reduce((sum, o) => sum + o.price, 0),
                readyCount: readyOrders.length,
                readySum: readyOrders.reduce((sum, o) => sum + o.price, 0),
                archivedCount: archivedOrders.length,
                archivedSum: archivedOrders.reduce((sum, o) => sum + o.price, 0),
            },
            salaries: {
                masterPaid,
                masterDebt,
                staffPaid,
                staffDebt,
            },
            expenses: {
                actual: totalActualExpenses,
                fixed: totalFixedCosts
            }
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
