import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "ar"];
const defaultLocale = "en";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if the pathname has a supported locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  let locale = defaultLocale;
  if (pathnameHasLocale) {
    locale = pathname.split("/")[1];
  } else {
    // Skip next internal requests, api requests, confirm requests, static files, etc.
    const isStatic =
      pathname.includes(".") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/auth/confirm");

    if (!isStatic) {
      request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
      return NextResponse.redirect(request.nextUrl);
    }
  }

  // 2. Supabase Session Refresh
  let response = NextResponse.next({
    request,
  });

  const hasEnv =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!hasEnv) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get current user claims
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // 3. Protect Admin Routes (e.g., /[locale]/admin)
  const isAdminRoute = pathname.startsWith(`/${locale}/admin`) || pathname === `/admin`;
  
  if (isAdminRoute && !user) {
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If user is already logged in and goes to login page, redirect them to admin dashboard
  const isAuthRoute = pathname.startsWith(`/${locale}/auth/login`);
  if (isAuthRoute && user) {
    const adminUrl = new URL(`/${locale}/admin`, request.url);
    return NextResponse.redirect(adminUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * - api routes
     * - auth/confirm endpoint
     */
    "/((?!_next/static|_next/image|favicon.ico|api|auth/confirm|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
