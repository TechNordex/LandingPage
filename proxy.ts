import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, COOKIE_NAME } from '@/lib/jwt'

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl
    const token = req.cookies.get(COOKIE_NAME)?.value
    const session = token ? await verifyJWT(token) : null

    // Logged-in user on /login → redirect to dashboard
    if (pathname === '/login' && session) {
        const dest = session.role === 'admin' ? '/admin' : '/dashboard'
        return NextResponse.redirect(new URL(dest, req.url))
    }

    // Protected routes → require auth
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', req.url))
        }
        // Client trying admin
        if (pathname.startsWith('/admin') && session.role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }
        // Admin trying client dashboard
        if (pathname.startsWith('/dashboard') && session.role === 'admin') {
            return NextResponse.redirect(new URL('/admin', req.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/login', '/dashboard/:path*', '/admin/:path*'],
}
