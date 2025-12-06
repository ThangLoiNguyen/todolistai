import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("firebase-token");
    const { pathname } = req.nextUrl;

    // If not login → redirect to login
    if (!token && pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", req.url));
    }


    // If login → redirect to dashboard
    if (
        token &&
        (pathname.startsWith("/login") ||
            pathname.startsWith("/register") ||
            pathname === "/")
    ) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register", "/"],
};