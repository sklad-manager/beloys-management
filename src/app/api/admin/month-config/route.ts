import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!year || !month) return NextResponse.json({ workingDays: 22 }); // Default fallback

    try {
        const config = await prisma.monthConfig.findUnique({
            where: {
                year_month: {
                    year: parseInt(year),
                    month: parseInt(month)
                }
            }
        });
        return NextResponse.json({ workingDays: config?.workingDays || 22 });
    } catch (error) {
        return NextResponse.json({ workingDays: 22 });
    }
}

export async function POST(req: Request) {
    try {
        const { year, month, workingDays } = await req.json();
        const config = await prisma.monthConfig.upsert({
            where: {
                year_month: {
                    year: parseInt(year),
                    month: parseInt(month)
                }
            },
            update: { workingDays: parseInt(workingDays) },
            create: {
                year: parseInt(year),
                month: parseInt(month),
                workingDays: parseInt(workingDays)
            }
        });
        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
