import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define protected routes - all /dashboard routes require authentication
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export const proxy = clerkMiddleware(async (auth, req) => {
  // Get user ID to check if authenticated
  const { userId } = await auth();

  // Redirect authenticated users from homepage to dashboard
  if (userId && req.nextUrl.pathname === "/") {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Protect all /dashboard routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
