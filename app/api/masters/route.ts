import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const masters = await prisma.master.findMany();
        return NextResponse.json(masters);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching masters' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const master = await prisma.master.create({
            data: {
                name: body.name,
                percentage: body.percentage,
            },
        });
        return NextResponse.json(master);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating master' }, { status: 500 });
    }
}
