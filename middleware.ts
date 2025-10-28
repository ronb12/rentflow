import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get role from URL or localStorage (we'll handle this client-side)
  const role = request.nextUrl.searchParams.get('role');
  
  // Manager-only routes
  const managerRoutes = [
    '/dashboard/properties',
    '/dashboard/tenants',
    '/dashboard/leases',
    '/dashboard/invoices',
    '/dashboard/inspections',
    '/dashboard/work-orders',
    '/dashboard/reports'
  ];
  
  // Check if accessing manager-only route
  const isManagerRoute = managerRoutes.some(route => pathname.startsWith(route));
  
  if (isManagerRoute && role === 'renter') {
    // Redirect renters away from manager routes
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};
