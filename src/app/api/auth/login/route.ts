import { NextResponse } from 'next/server';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json(
                { error: 'Пароль обязателен' },
                { status: 400 }
            );
        }

        // Verify password
        if (verifyPassword(password)) {
            // Create session
            await createSession();

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { error: 'Неверный пароль' },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Ошибка сервера' },
            { status: 500 }
        );
    }
}
