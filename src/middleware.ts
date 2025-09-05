import { createClient } from '@/integrations/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { errorTracker } from '@/lib/error-tracking';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static assets, API routes, and public files
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/sw.js') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    const { supabase, response } = createClient(request);

  // Only refresh session for authenticated routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/profile') || pathname.startsWith('/contribute')) {
    await supabase.auth.getUser();
  }

  // Maintenance mode check (only for non-static routes)
  const maintenanceBypassPaths = ['/maintenance', '/api/'];

  if (!maintenanceBypassPaths.some(p => pathname.startsWith(p))) {
    try {
      // Cache maintenance mode check for 5 minutes
      const cacheKey = 'maintenance_mode';
      let maintenanceMode = false;
      
      // Simple in-memory cache (in production, use Redis or similar)
      if (typeof globalThis !== 'undefined' && (globalThis as any).maintenanceCache) {
        const cache = (globalThis as any).maintenanceCache;
        if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < 300000) {
          maintenanceMode = cache[cacheKey].value;
        } else {
          const { data: settings } = await supabase
            .from('settings')
            .select('maintenance_mode')
            .eq('id', 1)
            .single();
          
          maintenanceMode = settings?.maintenance_mode || false;
          cache[cacheKey] = { value: maintenanceMode, timestamp: Date.now() };
        }
      } else {
        const { data: settings } = await supabase
          .from('settings')
          .select('maintenance_mode')
          .eq('id', 1)
          .single();
        
        maintenanceMode = settings?.maintenance_mode || false;
      }

      if (maintenanceMode) {
        // Check if the user is an admin (only if authenticated)
        const { data: { user } } = await supabase.auth.getUser();
        let isAdmin = false;
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();
          if (profile && profile.role === 'admin') {
            isAdmin = true;
          }
        }

        // If maintenance mode is on and the user is not an admin, redirect
        if (!isAdmin) {
          return NextResponse.rewrite(new URL('/maintenance', request.url));
        }
      }
    } catch (e: any) {
      // If settings table doesn't exist or has error, let it pass
      console.warn("Middleware couldn't check for maintenance mode:", e.message);
    }
  }

  // Add security headers to response
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // HSTS header (only for HTTPS)
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  // Permissions Policy
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Content Security Policy - Fixed for Supabase and YouTube
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.youtube.com blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.supabase.co https://www.googleapis.com https://*.supabase.co https://crdegxuvexhursfozawq.supabase.co",
    "frame-src 'self' https://www.youtube.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)

  return response
  } catch (error: any) {
    // Log middleware errors
    console.error('Middleware error:', error);
    
    // Try to log the error (but don't fail if logging fails)
    try {
      await errorTracker.logServerError(error, {
        pageUrl: request.url,
        userAgent: request.headers.get('user-agent') || undefined,
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || 
                   request.headers.get('x-real-ip') || 
                   '127.0.0.1',
        additionalData: {
          middleware: true,
          pathname: pathname
        }
      });
    } catch (loggingError) {
      console.error('Failed to log middleware error:', loggingError);
    }
    
    // Return a basic response even if middleware fails
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
