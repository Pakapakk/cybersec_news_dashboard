import { NextResponse } from "next/server";

// Define which routes are public (unauthenticated access allowed)
const publicRoutes = ["/SignIn", "/SignUp", "/favicon.ico", "/_next"];

// Utility to check if a request path starts with a public route
function isPublicRoute(pathname) {
  return publicRoutes.some((route) => pathname.startsWith(route));
}

// Middleware handler
export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("authToken")?.value;

  // 1. If user is NOT authenticated and accessing a protected route → redirect to SignIn
  if (!token && !isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL("/SignIn", request.url));
  }

  // 2. If user IS authenticated and accessing SignIn/SignUp → redirect to home
  if (token && ["/SignIn", "/SignUp"].includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Config to apply middleware to all routes
export const config = {
  matcher: ["/((?!api|static|_next|.*\\..*).*)"],
};