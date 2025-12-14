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

        return NextResponse.json(newMaster);
    } catch (error) {
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
        await prisma.master.delete({
            where: { id: parseInt(id) }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete master' }, { status: 500 });
    }
}
