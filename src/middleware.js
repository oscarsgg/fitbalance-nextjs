import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export function middleware(request) {
  // Get token from cookies
  const token = request.cookies.get("token")?.value

  // Define protected routes
  const protectedRoutes = ["/dashboard", "/schedule", "/patients", "/appointments", "/profile"]
  const authRoutes = ["/login", "/register"]
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If accessing auth routes with valid token, redirect to dashboard
  if (isAuthRoute && token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
      // Check if token has nutritionistId (new format)
      if (decoded.nutritionistId) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } catch (error) {
      // Token is invalid, allow access to auth routes
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard", 
    "/login", 
    "/register", 
    "/schedule/:path*", 
    "/patients/:path*", 
    "/appointments/:path*", 
    "/profile"],
}

