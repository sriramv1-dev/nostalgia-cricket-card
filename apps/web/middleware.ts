import { createServerClient } from '@supabase/ssr'
import type { CookieMethodsServer } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/admin/session'

const PROTECTED_ROUTES = ['/collection', '/packs', '/trade', '/battle']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes use cookie-based auth, independent of Supabase
  if (pathname.startsWith('/admin')) {
    if (pathname !== '/admin/login') {
      const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value
      const secret = process.env.ADMIN_COOKIE_SECRET ?? ''
      const valid = token ? await verifyAdminToken(token, secret) : false

      if (!valid) {
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = '/admin/login'
        return NextResponse.redirect(loginUrl)
      }
    }
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      } satisfies CookieMethodsServer,
    }
  )

  // Refresh session — do not add logic between createServerClient and getUser.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is already logged in and visits login, redirect to collection
  if (pathname === '/login' && user) {
    const redirectTo =
      request.nextUrl.searchParams.get('redirectTo') || '/collection'
    const destination = request.nextUrl.clone()
    destination.pathname = redirectTo
    destination.searchParams.delete('redirectTo')
    return NextResponse.redirect(destination)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
