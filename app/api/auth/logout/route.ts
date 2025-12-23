/**
 * Development-only mock logout API
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const isDevelopment = process.env.NODE_ENV !== 'production'

export async function POST() {
    if (!isDevelopment) {
        return NextResponse.json(
            { ok: false, message: 'Auth endpoint not implemented' },
            { status: 501 }
        )
    }

    const response = NextResponse.json({ ok: true })

    // Clear session cookie
    response.cookies.set('session', '', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
    })

    // Clear dev-user cookie
    response.cookies.set('dev-user', '', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
    })

    return response
}
