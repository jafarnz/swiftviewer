import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/settings']
  const isProtectedRoute = protectedRoutes.some(path => 
    req.nextUrl.pathname.startsWith(path)
  )

  // Define auth routes (signin/signup)
  const authRoutes = ['/signin', '/signup']
  const isAuthRoute = authRoutes.includes(req.nextUrl.pathname)

  if (!session) {
    // If user is not signed in and trying to access protected routes
    if (isProtectedRoute) {
      const redirectUrl = new URL('/signin', req.url)
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  } else {
    // If user is signed in and trying to access auth routes
    if (isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 