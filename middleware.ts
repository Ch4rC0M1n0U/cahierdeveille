import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/db"

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === "/" || path === "/login" || path === "/register"

  // Get the token from cookies
  const token = request.cookies.get("auth-token")?.value || ""

  // If the path is public and the user is logged in, redirect to dashboard
  if (isPublicPath && token) {
    const user = verifyToken(token)
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // If the path is not public and the user is not logged in, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/profile/:path*", "/cahier/:path*", "/new-cahier/:path*"],
}
