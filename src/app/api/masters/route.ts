import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const masters = await prisma.master.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(masters);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch masters' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, percentage } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const newMaster = await prisma.master.create({
            data: {
                name,
                percentage: parseFloat(percentage) || 0
            }
        });

        // Log the creation
        await prisma.systemLog.create({
            data: {
                type: 'MASTER',
                action: 'ADD',
                targetId: name,
                details: `Добавлен новый мастер: ${name} (${percentage}%)`,
                newData: JSON.stringify(newMaster),
                operator: 'Admin'
            }
        });

        return NextResponse.json(newMaster);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create master' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
        const masterId = parseInt(id);

        // Check if master has ACTIVE orders (not archived)
        const activeOrdersCount = await prisma.order.count({
            where: {
                masterId,
                status: { not: 'Выдан' } // Archive is 'Выдан'
            }
        });

        // Check for unpaid salary logs
        const unpaidLogsCount = await prisma.salaryLog.count({
            where: {
                masterId,
                isPaid: false
            }
        });

        if (activeOrdersCount > 0 || unpaidLogsCount > 0) {
            let errorMsg = 'Нельзя удалить мастера: ';
            if (activeOrdersCount > 0) errorMsg += `есть активные заказы (${activeOrdersCount} шт.). `;
            if (unpaidLogsCount > 0) errorMsg += `есть невыплаченная зарплата. `;

            return NextResponse.json({ error: errorMsg }, { status: 400 });
        }

        const deleted = await prisma.master.delete({
            where: { id: masterId }
        });

        // Log the deletion
        await prisma.systemLog.create({
            data: {
                type: 'MASTER',
                action: 'DELETE',
                targetId: deleted.name,
                details: `Мастер "${deleted.name}" удален (все его заказы были в архиве)`,
                oldData: JSON.stringify(deleted),
                operator: 'Admin'
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete master error:', error);
        return NextResponse.json({ error: 'Ошибка при удалении мастера: ' + (error.message || 'Неизвестная ошибка') }, { status: 500 });
    }
}
