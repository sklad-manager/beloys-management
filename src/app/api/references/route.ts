import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

        return NextResponse.json(newItem);

    } catch (error) {
        console.error('Ошибка создания записи справочника:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
