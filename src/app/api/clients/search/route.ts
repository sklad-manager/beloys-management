import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query || query.length < 2) {
        return NextResponse.json([]);
    }

    try {
        const clients = await prisma.client.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { phone: { contains: query, mode: 'insensitive' } },
                    { phone2: { contains: query, mode: 'insensitive' } }
                ]
            },
            take: 10,
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(clients);
    } catch (error) {
        console.error('Error searching clients:', error);
        return NextResponse.json({ error: 'Failed to search clients' }, { status: 500 });
    }
}
