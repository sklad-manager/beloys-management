// Authentication utilities for session management

import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'belous_session';
const SESSION_SECRET = 'belous_authenticated'; // Simple token for session

/**
 * Verify if the provided password matches the configured app password
 */
export function verifyPassword(password: string): boolean {
    const appPassword = process.env.APP_PASSWORD;

    if (!appPassword) {
        console.error('APP_PASSWORD environment variable is not set!');
        return false;
    }

    return password === appPassword;
}

/**
 * Create a session by setting a secure cookie
 */
export async function createSession() {
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, SESSION_SECRET, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
}

/**
 * Check if user has a valid session
 */
export async function isAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME);

    return session?.value === SESSION_SECRET;
}

/**
 * Destroy the session by clearing the cookie
 */
export async function destroySession() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}
