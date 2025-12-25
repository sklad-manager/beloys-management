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
        const deleted = await prisma.master.delete({
            where: { id: parseInt(id) }
        });

        // Log the deletion
        await prisma.systemLog.create({
            data: {
                type: 'MASTER',
                action: 'DELETE',
                targetId: deleted.name,
                details: `Мастер "${deleted.name}" удален`,
                oldData: JSON.stringify(deleted),
                operator: 'Admin'
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete master' }, { status: 500 });
    }
}
