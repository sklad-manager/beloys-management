import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    try {
        if (type) {
            const items = await prisma.referenceItem.findMany({
                where: { type: type },
                orderBy: { value: 'asc' }
            });
            return NextResponse.json(items);
        } else {
            const items = await prisma.referenceItem.findMany({
                orderBy: { value: 'asc' }
            });
            return NextResponse.json(items);
        }
    } catch (error) {
        console.error('Ошибка получения справочника:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, value } = body;

        if (!type || !value) {
            return NextResponse.json({ error: 'Не указан тип или значение' }, { status: 400 });
        }

        // Проверяем, существует ли уже такое значение
        const existing = await prisma.referenceItem.findFirst({
            where: { type, value }
        });

        if (existing) {
            return NextResponse.json(existing);
        }

        const newItem = await prisma.referenceItem.create({
            data: { type, value }
        });

        // Log the creation
        await prisma.systemLog.create({
            data: {
                type: 'REFERENCE',
                action: 'ADD',
                targetId: `${type}:${value}`,
                details: `В справочник "${type}" добавлено значение: ${value}`,
                operator: 'Admin'
            }
        });

        return NextResponse.json(newItem);

    } catch (error) {
        console.error('Ошибка создания записи справочника:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
        const deleted = await prisma.referenceItem.delete({
            where: { id: parseInt(id) }
        });

        // Log the deletion
        await prisma.systemLog.create({
            data: {
                type: 'REFERENCE',
                action: 'DELETE',
                targetId: `${deleted.type}:${deleted.value}`,
                details: `Из справочника "${deleted.type}" удалено значение: ${deleted.value}`,
                operator: 'Admin'
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Ошибка удаления записи справочника:', error);
        return NextResponse.json({ error: 'Ошибка при удалении' }, { status: 500 });
    }
}

