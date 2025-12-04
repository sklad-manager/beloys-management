import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    try {
        const where = type ? { type } : {};
        const items = await prisma.referenceItem.findMany({
            where,
            orderBy: { value: 'asc' },
        });
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching references' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const item = await prisma.referenceItem.create({
            data: {
                type: body.type,
                value: body.value,
            },
        });
        return NextResponse.json(item);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating reference' }, { status: 500 });
    }
}
