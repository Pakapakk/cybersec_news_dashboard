import { NextResponse } from "next/server";

// Define public routes that do not require authentication
const publicRoutes = ["/", "/NewsList", "/SignIn", "/SignUp", "/favicon.ico", "/_next"];

// Utility to check if a path is public
function isPublicRoute(pathname) {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(route));
}

// Middleware function
export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("authToken")?.value;

  // Protected paths — only /Bookmark and any bookmark-related API
  const isBookmarkPage = pathname === "/Bookmark";
  const isBookmarkAPI = pathname.startsWith("/api/bookmark");


  if (!token && (isBookmarkPage || isBookmarkAPI)) {
    return NextResponse.redirect(new URL("/SignIn", request.url));
  }

  if (token && ["/SignIn", "/SignUp"].includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!static|.*\\..*|_next).*)"],
};
