import { NextResponse } from 'next/server';

const SUPPORTED_LANGS = ['es', 'en'];
const DEFAULT_LANG = 'es';

/**
 * Proxy handler for i18n routing (Next.js 16+)
 * - Redirects / to /es (default language)
 * - Redirects invalid language routes to /es (e.g., /fr, /de)
 * - Preserves pathname when switching languages
 */
export default function proxy(request) {
  const pathname = request.nextUrl.pathname;

  // Handle root path - redirect to default language
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${DEFAULT_LANG}`, request.url));
  }

  // Extract the first segment to check if it's a language code
  const segments = pathname.split('/').filter(Boolean);
  const potentialLang = segments[0];

  // If first segment is not a supported language, check if it should be redirected
  if (segments.length > 0 && potentialLang && !SUPPORTED_LANGS.includes(potentialLang)) {
    // Don't redirect API routes or Next.js internal routes
    if (!pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.includes('.')) {
      // Redirect non-API routes with invalid language to default language
      return NextResponse.redirect(new URL(`/${DEFAULT_LANG}${pathname}`, request.url));
    }
  }

  // Let all other routes pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match root and all paths except:
    // - API routes (/api/...)
    // - Next.js internals (/_next/...)
    // - Static files (extensions like .png, .jpg, etc.)
    '/((?!api/|_next/|[^?]*\\.(?:jpg|jpeg|gif|png|webp|svg|css|js)).*)',
  ],
};
