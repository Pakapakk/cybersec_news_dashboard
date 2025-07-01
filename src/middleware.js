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


// import { NextResponse } from "next/server";

// // Only these pages are public
// const publicRoutes = ["/SignIn", "/SignUp", "/favicon.ico"];

// function isPublicRoute(pathname) {
//   if (publicRoutes.includes(pathname)) return true;
//   // Still allow Next.js internal assets
//   if (pathname.startsWith("/_next/") || pathname.includes(".")) return true;
//   return false;
// }

// export function middleware(request) {
//   const { pathname, origin, search } = request.nextUrl;
//   const token = request.cookies.get("authToken")?.value;

//   if (isPublicRoute(pathname)) {
//     // If already logged in, redirect away from SignIn/SignUp
//     if (token && (pathname === "/SignIn" || pathname === "/SignUp")) {
//       return NextResponse.redirect(new URL("/", origin));
//     }
//     return NextResponse.next();
//   }

//   // For all other routes, require authentication
//   if (!token) {
//     const signInUrl = new URL("/SignIn", origin);
//     signInUrl.searchParams.set("redirect", pathname + search);
//     return NextResponse.redirect(signInUrl);
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!_next/|favicon\\.ico|.*\\..+).*)"],
// };
