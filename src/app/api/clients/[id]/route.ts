import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: idString } = await params;
    const id = parseInt(idString);

    if (isNaN(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    try {
        const client = await prisma.client.findUnique({
            where: { id },
            include: {
                orders: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                }
            }
        });

        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        return NextResponse.json(client);
    } catch (error) {
        console.error('Error fetching client:', error);
        return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: idString } = await params;
    const id = parseInt(idString);
    const body = await request.json();

    if (isNaN(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    try {
        const updatedClient = await prisma.client.update({
            where: { id },
            data: {
                notes: body.notes
            }
        });

        return NextResponse.json(updatedClient);
    } catch (error) {
        console.error('Error updating client:', error);
        return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
    }
}
