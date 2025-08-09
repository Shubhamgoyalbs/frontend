import { NextRequest, NextResponse } from 'next/server'
import { getUserPrimaryRoleFromToken, isTokenExpired } from '@/utils/jwtUtils'

// Define protected routes and their required roles based on your structure
const ROUTE_PERMISSIONS = {
  '/user': ['USER', 'ADMIN'],           // User routes (cart, orders, profile, sellers)
  '/seller': ['SELLER', 'ADMIN'],       // Seller routes (home/dashboard)
  '/admin': ['ADMIN'],                  // Future admin routes
} as const

// Routes that require authentication
const PROTECTED_ROUTES = ['/user', '/seller', '/admin']

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get token from localStorage (we'll handle this differently since middleware can't access localStorage)
  // We'll use a different approach with component-level protection
  
  // Skip middleware for API routes and static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // For now, let the request through and handle protection at component level
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
