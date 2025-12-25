import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get('staffId');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    try {
        const shifts = await prisma.staffShift.findMany({
            where: {
                ...(staffId && { staffId: parseInt(staffId) }),
                ...(start && end && {
                    date: {
                        gte: new Date(start),
                        lte: new Date(end + 'T23:59:59')
                    }
                })
            },
            include: {
                staff: true
            },
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(shifts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { staffId, date, startTime, endTime, hours, amount } = await req.json();
        const shift = await prisma.staffShift.create({
            data: {
                staffId: parseInt(staffId),
                date: new Date(date),
                startTime,
                endTime,
                hours: parseFloat(hours),
                amount: parseFloat(amount)
            }
        });
        return NextResponse.json(shift);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create shift' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const { shiftIds, totalAmount, staffName } = await req.json();

        // 1. Mark shifts as paid
        await prisma.staffShift.updateMany({
            where: { id: { in: shiftIds } },
            data: {
                isPaid: true,
                paidAt: new Date()
            }
        });

        // 2. Create cash transaction
        await prisma.cashTransaction.create({
            data: {
                type: 'Expense',
                category: 'Staff Salary',
                description: `Выплата зарплаты (Админ): ${staffName}`,
                amount: parseFloat(totalAmount),
                method: 'Cash',
                relatedEntity: staffName,
                date: new Date()
            }
        });

        // Log the payment
        await prisma.systemLog.create({
            data: {
                type: 'SALARY',
                action: 'PAYMENT',
                targetId: staffName,
                details: `Выплачена зарплата администратору ${staffName}: ${totalAmount}₴`,
                newData: JSON.stringify({ shiftIds, totalAmount, staffName }),
                operator: 'Admin'
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to pay' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        await prisma.staffShift.delete({
            where: { id: parseInt(id) }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete shift' }, { status: 500 });
    }
}
