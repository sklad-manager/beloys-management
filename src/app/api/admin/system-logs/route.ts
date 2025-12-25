import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const logs = await prisma.systemLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 200
        });

        const formattedLogs = logs.map(log => ({
            id: log.id,
            type: log.type,
            action: log.action,
            targetId: log.targetId,
            details: log.details,
            oldData: log.oldData ? JSON.parse(log.oldData) : null,
            newData: log.newData ? JSON.parse(log.newData) : null,
            operator: log.operator,
            date: log.createdAt
        }));

        return NextResponse.json(formattedLogs);
    } catch (error) {
        console.error('Error fetching system logs:', error);
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}
