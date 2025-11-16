import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth')

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      return null
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname
      if (req.nextUrl.search) {
        from += req.nextUrl.search
      }

      return NextResponse.redirect(
        new URL(`/auth/login?from=${encodeURIComponent(from)}`, req.url)
      )
    }

    // Check role-based access
    const isHostRoute = req.nextUrl.pathname.startsWith('/host')
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

    if (isHostRoute && token.role !== 'HOST' && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (isAdminRoute && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/wallet/:path*',
    '/session/:path*',
    '/host/:path*',
    '/admin/:path*',
    '/auth/:path*',
  ],
}
