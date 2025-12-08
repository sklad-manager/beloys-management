import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Получаем последние 50 транзакций
        const transactions = await prisma.cashTransaction.findMany({
            orderBy: { date: 'desc' },
            take: 50
        });

        // Считаем баланс 
        // (В будущем можно сюда добавить сумму наличных из Заказов, если они не дублируются)
        const allTransactions = await prisma.cashTransaction.findMany();
        const balance = allTransactions.reduce((acc, t) => {
            return t.type === 'Income' ? acc + t.amount : acc - t.amount;
        }, 0);

        return NextResponse.json({
            balance,
            transactions
        });
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching cash data' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // body: { type: 'Income' | 'Expense', amount: number, description: string, category: string }
        const newTransaction = await prisma.cashTransaction.create({
            data: {
                type: body.type,
                amount: parseFloat(body.amount),
                description: body.description || '',
                category: body.category || 'Manual',
                method: 'Cash', // По умолчанию Наличные
                date: new Date()
            }
        });

        return NextResponse.json(newTransaction);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating transaction' }, { status: 500 });
    }
}
