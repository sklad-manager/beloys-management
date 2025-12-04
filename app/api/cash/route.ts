import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const transactions = await prisma.cashTransaction.findMany({
            orderBy: { date: 'asc' },
        });
        return NextResponse.json(transactions);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching cash transactions' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const transaction = await prisma.cashTransaction.create({
            data: {
                date: new Date(body.date),
                type: body.type,
                category: body.category,
                description: body.description,
                amount: body.amount,
                method: body.method,
                relatedEntity: body.relatedEntity,
            },
        });
        return NextResponse.json(transaction);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating transaction' }, { status: 500 });
    }
}
