# Authentication Coding Standards

This document outlines the authentication standards for this project using Clerk.

## Authentication Provider

### Clerk - MANDATORY

**CRITICAL REQUIREMENT:** This project uses **Clerk** exclusively for all authentication.

- ✅ **ONLY use Clerk** for authentication
- ❌ **NO other auth providers** (NextAuth.js, Auth0, Firebase Auth, etc.)
- ❌ **NO custom authentication implementations**

## Package & Setup

### Package
```
@clerk/nextjs
```

### Environment Variables

Required environment variables in `.env.local` (never commit to git):

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx
```

### Provider Setup

The app must be wrapped with `<ClerkProvider>` in the root layout:

```typescript
// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

## Middleware

### Configuration

**CRITICAL:** Always use `clerkMiddleware()` from `@clerk/nextjs/server`.

```typescript
// src/middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
```

### ❌ Deprecated Patterns - DO NOT USE

```typescript
// WRONG - authMiddleware is deprecated
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/'],
});
```

## Server-Side Authentication

### Import Path

**CRITICAL:** Server-side auth utilities MUST be imported from `@clerk/nextjs/server`.

```typescript
// ✅ CORRECT
import { auth, currentUser } from '@clerk/nextjs/server';

// ❌ WRONG - Do not use for server components
import { auth } from '@clerk/nextjs';
```

### Getting Current User

Always use `async/await` when calling `auth()`:

```typescript
// Server Component or Server Action
import { auth } from '@clerk/nextjs/server';

export default async function ProtectedPage() {
  const { userId } = await auth();

  if (!userId) {
    // Handle unauthenticated state
    redirect('/sign-in');
  }

  // User is authenticated
  return <div>Welcome, user {userId}</div>;
}
```

### Getting Full User Object

```typescript
import { currentUser } from '@clerk/nextjs/server';

export default async function ProfilePage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div>
      <h1>Welcome, {user.firstName}</h1>
      <p>Email: {user.emailAddresses[0]?.emailAddress}</p>
    </div>
  );
}
```

## Client-Side Authentication

### Import Path

Client-side utilities and components are imported from `@clerk/nextjs`:

```typescript
// ✅ CORRECT for client components
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
  useAuth
} from '@clerk/nextjs';
```

### Available Components

| Component | Purpose |
|-----------|---------|
| `<SignInButton>` | Renders a button that triggers sign-in flow |
| `<SignUpButton>` | Renders a button that triggers sign-up flow |
| `<SignedIn>` | Renders children only when user is signed in |
| `<SignedOut>` | Renders children only when user is signed out |
| `<UserButton>` | Renders user avatar with dropdown menu |

### Example Usage

```typescript
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';

export function Header() {
  return (
    <header>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
}
```

### Client Hooks

For client components that need auth state:

```typescript
'use client';

import { useUser, useAuth } from '@clerk/nextjs';

export function UserGreeting() {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <div>Please sign in</div>;

  return <div>Hello, {user.firstName}!</div>;
}
```

## Security Requirements

### User Data Isolation

**CRITICAL:** All data access MUST be scoped to the authenticated user.

```typescript
// /data/workouts.ts
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getUserWorkouts() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // CRITICAL: Always filter by userId
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}
```

### Server Actions

Always validate authentication in Server Actions:

```typescript
'use server';

import { auth } from '@clerk/nextjs/server';

export async function createWorkout(data: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Proceed with authenticated operation
}
```

## Quick Reference

### Import Cheatsheet

| Context | Import From |
|---------|-------------|
| Server Components | `@clerk/nextjs/server` |
| Server Actions | `@clerk/nextjs/server` |
| Route Handlers | `@clerk/nextjs/server` |
| Middleware | `@clerk/nextjs/server` |
| Client Components | `@clerk/nextjs` |

### Common Functions

| Function | Import | Usage |
|----------|--------|-------|
| `auth()` | `@clerk/nextjs/server` | Get userId and session info (server) |
| `currentUser()` | `@clerk/nextjs/server` | Get full user object (server) |
| `useUser()` | `@clerk/nextjs` | Get user in client components |
| `useAuth()` | `@clerk/nextjs` | Get auth state in client components |

## Security Checklist

Before implementing any authenticated feature, verify:

- [ ] Is `@clerk/nextjs/server` used for server-side imports?
- [ ] Is `auth()` called with `await`?
- [ ] Is `userId` validated before proceeding?
- [ ] Are database queries filtered by `userId`?
- [ ] Are Server Actions checking authentication?
- [ ] Is sensitive data only accessible to its owner?

## Enforcement

These standards are **mandatory** for all code in this project. Code reviews should reject any:
- Use of deprecated auth patterns (like `authMiddleware`)
- Missing authentication checks in Server Actions
- Data queries not filtered by userId
- Incorrect import paths for auth utilities
