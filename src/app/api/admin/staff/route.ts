import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const staff = await prisma.staff.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(staff);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, defaultRate } = await req.json();
        const staff = await prisma.staff.create({
            data: {
                name,
                defaultRate: parseFloat(defaultRate) || 0
            }
        });

        // Log the creation
        await prisma.systemLog.create({
            data: {
                type: 'STAFF',
                action: 'ADD',
                targetId: name,
                details: `Добавлен новый сотрудник: ${name}`,
                newData: JSON.stringify(staff),
                operator: 'Admin'
            }
        });

        return NextResponse.json(staff);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        const deleted = await prisma.staff.delete({
            where: { id: parseInt(id) }
        });

        // Log the deletion
        await prisma.systemLog.create({
            data: {
                type: 'STAFF',
                action: 'DELETE',
                targetId: deleted.name,
                details: `Сотрудник "${deleted.name}" удален`,
                oldData: JSON.stringify(deleted),
                operator: 'Admin'
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
    }
}
