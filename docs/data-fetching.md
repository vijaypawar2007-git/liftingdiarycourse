# Data Fetching

## ⚠️ CRITICAL: Server Components Only

**ALL data fetching in this application MUST be done via Server Components.**

### ✅ ALLOWED
- **Server Components** - The ONLY approved method for fetching data

### ❌ FORBIDDEN
- Route Handlers (API routes)
- Client Components
- Client-side hooks (useEffect, useSWR, React Query, etc.)
- Any other data fetching method

## Database Access Pattern

### Helper Functions in `/data` Directory

All database queries MUST be performed through helper functions located in the `/data` directory.

**Example structure:**
```
/data
  /workouts.ts     - Workout-related queries
  /exercises.ts    - Exercise-related queries
  /user.ts         - User-related queries
```

### Drizzle ORM Required

**ALL database queries MUST use Drizzle ORM.**

❌ **NEVER use raw SQL:**
```typescript
// WRONG - DO NOT DO THIS
const result = await db.execute(sql`SELECT * FROM workouts WHERE user_id = ${userId}`);
```

✅ **ALWAYS use Drizzle ORM:**
```typescript
// CORRECT
import { eq } from 'drizzle-orm';
import { workouts } from '@/db/schema';

export async function getUserWorkouts(userId: string) {
  const result = await db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));

  return result;
}
```

## 🔒 Security: User Data Isolation

**CRITICAL SECURITY REQUIREMENT:**

Every data fetching function MUST ensure that:
1. The current logged-in user can ONLY access their own data
2. Users CANNOT access data belonging to other users
3. All queries MUST filter by the authenticated user's ID

### Implementation Pattern

```typescript
// /data/workouts.ts
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getUserWorkouts() {
  // CRITICAL: Always get and validate the current user
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // CRITICAL: Always filter by userId
  const result = await db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));

  return result;
}
```

### Server Component Usage

```typescript
// app/dashboard/page.tsx
import { getUserWorkouts } from '@/data/workouts';

export default async function DashboardPage() {
  // Fetch data directly in the server component
  const workouts = await getUserWorkouts();

  return (
    <div>
      <h1>My Workouts</h1>
      {workouts.map(workout => (
        <div key={workout.id}>{workout.name}</div>
      ))}
    </div>
  );
}
```

## Security Checklist

Before implementing any data fetching function, verify:

- [ ] Is this a Server Component? (NOT a Client Component)
- [ ] Does the helper function exist in `/data` directory?
- [ ] Does the function use Drizzle ORM? (NOT raw SQL)
- [ ] Does the function call `auth()` to get the current user?
- [ ] Does the function check if `userId` exists?
- [ ] Does the query filter by `userId` to ensure data isolation?
- [ ] Can users ONLY access their own data?

## Why Server Components?

1. **Security** - Credentials and sensitive logic stay on the server
2. **Performance** - Reduces client bundle size and network requests
3. **Data freshness** - No stale cache issues
4. **SEO** - Content is rendered on the server
5. **Simplicity** - No loading states or error boundaries for data fetching

## Common Mistakes to Avoid

### ❌ Don't create API routes for data fetching
```typescript
// app/api/workouts/route.ts - DON'T DO THIS
export async function GET() {
  const workouts = await getUserWorkouts();
  return Response.json(workouts);
}
```

### ❌ Don't fetch in Client Components
```typescript
'use client';
// DON'T DO THIS
export function WorkoutList() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    fetch('/api/workouts')
      .then(r => r.json())
      .then(setWorkouts);
  }, []);

  return <div>...</div>;
}
```

### ✅ Do fetch in Server Components
```typescript
// app/workouts/page.tsx
import { getUserWorkouts } from '@/data/workouts';

export default async function WorkoutsPage() {
  const workouts = await getUserWorkouts();

  return <div>...</div>;
}
```

## Exception: Mutations

For data mutations (create, update, delete), use **Server Actions**:

```typescript
// app/workouts/actions.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { revalidatePath } from 'next/cache';

export async function createWorkout(data: { name: string }) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  await db.insert(workouts).values({
    ...data,
    userId, // CRITICAL: Always set userId
  });

  revalidatePath('/workouts');
}
```

## Summary

**Remember the golden rule:**
> Server Components → `/data` helpers → Drizzle ORM → User's own data only

Any deviation from this pattern is a violation of project architecture and security requirements.
