import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!year || !month) return NextResponse.json([]);

    try {
        const costs = await prisma.fixedCost.findMany({
            where: {
                year: parseInt(year),
                month: parseInt(month)
            }
        });
        return NextResponse.json(costs);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { year, month, category, amount } = await req.json();
        const cost = await prisma.fixedCost.upsert({
            where: {
                category_year_month: {
                    category,
                    year: parseInt(year),
                    month: parseInt(month)
                }
            },
            update: { amount: parseFloat(amount) },
            create: {
                category,
                year: parseInt(year),
                month: parseInt(month),
                amount: parseFloat(amount)
            }
        });
        return NextResponse.json(cost);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.fixedCost.delete({
            where: { id: parseInt(id) }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
