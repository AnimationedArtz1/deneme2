/**
 * Development-only mock auth API
 * 
 * WARNING: This file is for development/testing only.
 * In production, these endpoints should be replaced with real authentication.
 */

import { NextRequest, NextResponse } from 'next/server'

// Allow in development OR when ENABLE_MOCK_AUTH is set
const isMockAuthEnabled = process.env.NODE_ENV !== 'production' || process.env.ENABLE_MOCK_AUTH === 'true'

// Mock users for development
const MOCK_USERS = {
    admin: { id: '1', password: 'admin', role: 'admin' as const, displayName: 'Yönetici' },
    user: { id: '2', password: 'user', role: 'worker' as const, displayName: 'Personel' },
}

export async function POST(request: NextRequest) {
    if (!isMockAuthEnabled) {
        return NextResponse.json(
            { ok: false, message: 'Auth endpoint not implemented' },
            { status: 501 }
        )
    }

    try {
        const { username, password } = await request.json()

        const user = MOCK_USERS[username.toLowerCase() as keyof typeof MOCK_USERS]

        if (!user || user.password !== password) {
            return NextResponse.json(
                { ok: false, message: 'Kullanıcı adı veya şifre hatalı' },
                { status: 401 }
            )
        }

        // Create response
        const response = NextResponse.json({ ok: true })

        // Set session cookie
        response.cookies.set('session', 'dev-session', {
            httpOnly: true,
            secure: false, // Development only
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        })

        // Store user info in a separate cookie for dev persistence
        response.cookies.set('dev-user', JSON.stringify({
            id: user.id,
            username: username.toLowerCase(),
            role: user.role,
            displayName: user.displayName,
        }), {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
            path: '/',
        })

        return response
    } catch {
        return NextResponse.json(
            { ok: false, message: 'Invalid request' },
            { status: 400 }
        )
    }
}
