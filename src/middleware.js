// import { NextResponse } from "next/server";

// export const config = {
//   matcher: ["/((?!auth|_next|favicon.ico).*)"],
// };

// export function middleware(request) {
//   const token = request.cookies.get("authToken")?.value;

//   if (!token) {
//     return NextResponse.redirect(new URL("/auth/signin", request.url));
//   }

//   return NextResponse.next();
// }
