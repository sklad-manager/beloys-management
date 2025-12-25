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

        // Log the change
        await prisma.systemLog.create({
            data: {
                type: 'FIXED_COST',
                action: 'SAVE',
                targetId: category,
                details: `Плановая трата "${category}" сохранена: ${amount}₴ (${month}/${year})`,
                newData: JSON.stringify(cost),
                operator: 'Admin'
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

        const deleted = await prisma.fixedCost.delete({
            where: { id: parseInt(id) }
        });

        // Log the deletion
        await prisma.systemLog.create({
            data: {
                type: 'FIXED_COST',
                action: 'DELETE',
                targetId: deleted.category,
                details: `Плановая трата "${deleted.category}" удалена`,
                oldData: JSON.stringify(deleted),
                operator: 'Admin'
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
