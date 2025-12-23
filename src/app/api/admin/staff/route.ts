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
        await prisma.staff.delete({
            where: { id: parseInt(id) }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
    }
}
