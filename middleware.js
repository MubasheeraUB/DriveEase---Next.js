import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Protected routes that require authentication
const protectedPaths = ["/dashboard", "/students", "/instructors", "/courses", "/vehicles", "/training-schedules", "/payments", "/reports", "/messages", "/notifications", "/settings"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (!isProtected) return NextResponse.next();

  // Read token from cookie
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/students/:path*",
    "/instructors/:path*",
    "/courses/:path*",
    "/vehicles/:path*",
    "/training-schedules/:path*",
    "/payments/:path*",
    "/reports/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/settings/:path*",
  ],
};
