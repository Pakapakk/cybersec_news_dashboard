// middleware.js
import { NextResponse } from "next/server";

// This function should verify your user session, e.g. by checking a cookie or token
async function isAuthenticated(req) {
  // Replace with your actual token/session check logic
  return !!req.cookies.get("authToken")?.value;
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const auth = await isAuthenticated(req);

  const isAuthPage = pathname.startsWith("/SignIn") || pathname.startsWith("/SignUp");
  const isPublicOrStatic = pathname.startsWith("/_next") || pathname.includes(".");
  const isProtected = !isAuthPage && !isPublicOrStatic;

  // If user is not logged in and trying to access protected content → redirect to sign-in
  if (!auth && isProtected) {
    return NextResponse.redirect(new URL("/SignIn", req.url));
  }

  // If user is already logged in and tries to access sign-in/up pages → redirect to home
  if (auth && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Apply middleware to all routes except:
     * - Next.js internals (_next, static files)
     * - API routes (you can adjust as needed)
     */
    "/((?!_next/static|_next/image|.*\\..*|api).*)"
  ],
};
