/**
 * Development-only mock current user API
 */

import { NextRequest, NextResponse } from 'next/server'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Mock users for development
const MOCK_USERS: Record<string, { id: string; role: 'admin' | 'worker'; displayName: string }> = {
    admin: { id: '1', role: 'admin', displayName: 'Yönetici' },
    user: { id: '2', role: 'worker', displayName: 'Personel' },
}

// Import sessions from login route (in-memory for development)
// In a real app, this would be a database lookup
const sessions = new Map<string, { userId: string; username: string; role: 'admin' | 'worker'; displayName: string }>()

export async function GET(request: NextRequest) {
    if (!isDevelopment) {
        return NextResponse.json(
            { authenticated: false },
            { status: 200 }
        )
    }

    const sessionToken = request.cookies.get('session')?.value

    if (!sessionToken) {
        return NextResponse.json({ authenticated: false })
    }

    // For development, we'll decode the session from cookie
    // Since sessions map is per-instance and won't persist across restarts,
    // we'll use a simpler approach: store user info directly in a signed cookie

    // Check if we have a dev-user cookie (simpler approach for dev)
    const devUser = request.cookies.get('dev-user')?.value

    if (devUser) {
        try {
            const user = JSON.parse(devUser)
            return NextResponse.json({
                authenticated: true,
                user: {
                    id: user.id,
                    username: user.username,
                    displayName: user.displayName,
                    role: user.role,
                },
            })
        } catch {
            return NextResponse.json({ authenticated: false })
        }
    }

    return NextResponse.json({ authenticated: false })
}
