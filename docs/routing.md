# Routing Coding Standards

This document outlines the routing standards for this project.

## Route Structure

### Dashboard-Based Routes - MANDATORY

**CRITICAL REQUIREMENT:** All application routes must be accessed via `/dashboard`.

- ✅ **ONLY create routes under `/dashboard`** for all application features
- ❌ **NO top-level application routes** (except for `/` landing page)
- ❌ **NO routes outside the `/dashboard` hierarchy** for authenticated features

### Route Hierarchy

```
/                           # Public landing page
/dashboard                  # Main authenticated dashboard
/dashboard/workout/new      # Create new workout
/dashboard/workout/[id]     # View/edit specific workout
/dashboard/settings         # User settings (example)
```

### Examples

**Correct Route Patterns:**
```typescript
// ✅ CORRECT - Routes under /dashboard
src/app/dashboard/page.tsx                      // /dashboard
src/app/dashboard/workout/new/page.tsx          // /dashboard/workout/new
src/app/dashboard/workout/[workoutId]/page.tsx  // /dashboard/workout/:workoutId
src/app/dashboard/settings/page.tsx             // /dashboard/settings
```

**Incorrect Route Patterns:**
```typescript
// ❌ WRONG - Top-level routes for authenticated features
src/app/workout/page.tsx        // Should be /dashboard/workout
src/app/settings/page.tsx       // Should be /dashboard/settings
src/app/profile/page.tsx        // Should be /dashboard/profile
```

## Route Protection

### Middleware-Based Protection - MANDATORY

**CRITICAL REQUIREMENT:** Route protection MUST be implemented using Next.js middleware.

- ✅ **Use Next.js middleware** for route protection
- ❌ **NO page-level auth checks** as the primary protection mechanism
- ❌ **NO client-side redirects** for protecting routes

### Middleware Configuration

Create `src/middleware.ts` with Clerk middleware and route protection:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define protected routes - all /dashboard routes require authentication
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
```

### Protected vs Public Routes

| Route Pattern | Protection | Description |
|---------------|------------|-------------|
| `/` | Public | Landing page, accessible to all |
| `/sign-in` | Public | Clerk sign-in page |
| `/sign-up` | Public | Clerk sign-up page |
| `/dashboard` | Protected | Main dashboard, requires auth |
| `/dashboard/*` | Protected | All dashboard sub-routes require auth |

### What Happens on Protected Routes

When an unauthenticated user tries to access a protected route:

1. Middleware intercepts the request
2. `auth.protect()` is called
3. User is automatically redirected to Clerk sign-in
4. After successful sign-in, user is redirected back to the original route

## Key Principles

1. **Dashboard First**: All authenticated features live under `/dashboard`
2. **Middleware Protection**: Route protection is handled at the middleware level, not per-page
3. **Consistent Hierarchy**: Follow the established route structure for new features

## Security Checklist

Before creating a new route, verify:

- [ ] Is the route under `/dashboard` for authenticated features?
- [ ] Is the middleware configured to protect this route?
- [ ] Do API routes validate authentication separately?

## Enforcement

These standards are **mandatory** for all code in this project. Code reviews should reject any:
- Authenticated routes outside of `/dashboard`
- Page-level auth checks as primary protection
- Missing middleware protection for new route patterns
