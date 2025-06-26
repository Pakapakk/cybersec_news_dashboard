// app/api/signout/route.js
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Signed out" });
  response.cookies.set("authToken", "", { path: "/", maxAge: 0 }); // clear cookie
  return response;
}