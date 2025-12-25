import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const clients = await prisma.client.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { orders: true }
                }
            }
        });

        // Create CSV Content
        // Header
        const headers = ['ID', 'Имя', 'Телефон', 'Заметки', 'Дата регистрации', 'Кол-во заказов'];
        const rows = clients.map(c => [
            c.id,
            `"${c.name.replace(/"/g, '""')}"`,
            `"${c.phone.replace(/"/g, '""')}"`,
            `"${(c.notes || '').replace(/"/g, '""')}"`,
            c.createdAt.toISOString(),
            c._count.orders
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Return as a downloadable file
        return new Response(csvContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename="clients_backup.csv"',
            },
        });

    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Failed to export clients' }, { status: 500 });
    }
}
