import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { i18n } from '@/lib/i18n/config'

const PUBLIC_FILE = /\.(.*)$/
const protectedRoutes = ['/dashboard', '/schedule', '/patients', '/appointments', '/profile']
const authRoutes = ['/login', '/register']

function getPathWithoutLocale(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return '/'
  }

  if (i18n.locales.includes(segments[0])) {
    const remaining = segments.slice(1).join('/')
    return remaining ? `/${remaining}` : '/'
  }

  return pathname
}

function hasInvalidLocalePrefix(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return false

  const [first] = segments
  const looksLikeLocale = /^[a-zA-Z]{2}$/.test(first)

  return looksLikeLocale && !i18n.locales.includes(first)
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${i18n.defaultLocale}`, request.url))
  }

  if (hasInvalidLocalePrefix(pathname)) {
    const segments = pathname.split('/').filter(Boolean)
    const [, ...rest] = segments
    const newPath = `/${i18n.defaultLocale}${rest.length ? `/${rest.join('/')}` : ''}`
    return NextResponse.redirect(new URL(newPath, request.url))
  }

  const pathWithoutLocale = getPathWithoutLocale(pathname)
  const token = request.cookies.get('token')?.value

  const isProtectedRoute = protectedRoutes.some((route) => pathWithoutLocale.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathWithoutLocale.startsWith(route))

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthRoute && token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
        nutritionistId?: string
      }

      if (decoded.nutritionistId) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch {
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
