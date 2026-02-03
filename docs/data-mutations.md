# Data Mutations

## ⚠️ CRITICAL: Server Actions Only

**ALL data mutations in this application MUST be done via Server Actions.**

### ✅ ALLOWED
- **Server Actions** - The ONLY approved method for mutating data

### ❌ FORBIDDEN
- Route Handlers (API routes)
- Client-side mutations
- Direct database calls from components
- Any other mutation method

## Architecture Overview

Data mutations follow a two-layer architecture:

```
Server Action (actions.ts) → Data Helper (src/data/*.ts) → Database (Drizzle ORM)
```

1. **Server Actions** handle validation, authorization, and orchestration
2. **Data Helpers** handle database operations via Drizzle ORM

## Server Actions

### File Location: Colocated `actions.ts`

All server actions MUST be placed in an `actions.ts` file colocated with the page or feature that uses them.

**Example structure:**
```
src/app/
  /workouts/
    page.tsx          - Server Component
    actions.ts        - Server Actions for this page
  /exercises/
    page.tsx          - Server Component
    actions.ts        - Server Actions for this page
  /dashboard/
    page.tsx          - Server Component
    actions.ts        - Server Actions for this page
```

### ❌ FORBIDDEN: FormData Parameters

**NEVER use `FormData` as a parameter type for server actions.**

```typescript
// WRONG - DO NOT DO THIS
'use server';

export async function createWorkout(formData: FormData) {
  const name = formData.get('name');
  // ...
}
```

### ✅ REQUIRED: Typed Parameters

**ALWAYS use typed parameters for server actions.**

```typescript
// CORRECT
'use server';

export async function createWorkout(data: { name: string; date: Date }) {
  // ...
}
```

### ✅ REQUIRED: Zod Validation

**ALL server actions MUST validate their arguments using Zod.**

```typescript
// CORRECT - Full example
'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { createWorkoutForUser } from '@/data/workouts';

const createWorkoutSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  date: z.coerce.date(),
  notes: z.string().max(500).optional(),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkout(input: CreateWorkoutInput) {
  // 1. Validate input with Zod
  const validated = createWorkoutSchema.parse(input);

  // 2. Authenticate user
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // 3. Call data helper for database operation
  await createWorkoutForUser(userId, validated);

  // 4. Revalidate affected paths
  revalidatePath('/workouts');
}
```

### ❌ FORBIDDEN: Server-Side Redirects

**NEVER use `redirect()` from `next/navigation` inside server actions.**

Navigation after a mutation should ALWAYS be handled client-side using `useRouter` from `next/navigation`.

```typescript
// WRONG - DO NOT DO THIS
'use server';

import { redirect } from 'next/navigation';

export async function createWorkout(input: CreateWorkoutInput) {
  // ... mutation logic
  redirect('/workouts'); // ❌ FORBIDDEN
}
```

### ✅ REQUIRED: Client-Side Navigation

**Server actions should return data that the client uses to navigate.**

```typescript
// CORRECT - Server Action returns redirect URL
'use server';

type CreateWorkoutResult =
  | { success: true; redirectUrl: string }
  | { success: false; fieldErrors: FieldErrors };

export async function createWorkout(input: CreateWorkoutInput): Promise<CreateWorkoutResult> {
  const result = createWorkoutSchema.safeParse(input);

  if (!result.success) {
    // Return field errors for client to display
    const fieldErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof FieldErrors;
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return { success: false, fieldErrors };
  }

  // ... auth and mutation logic

  revalidatePath('/workouts');
  return { success: true, redirectUrl: '/workouts' };
}
```

```typescript
// CORRECT - Client Component handles navigation
'use client';

import { useRouter } from 'next/navigation';

export function WorkoutForm() {
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const result = await createWorkout({
      name: formData.get('name') as string,
    });

    if (result.success) {
      router.push(result.redirectUrl); // ✅ Client-side navigation
    } else {
      // Handle field errors
      setFieldErrors(result.fieldErrors);
    }
  }

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

## Data Helper Functions

### File Location: `/src/data` Directory

All database mutation operations MUST be performed through helper functions located in the `/src/data` directory.

**Example structure:**
```
src/data/
  /workouts.ts     - Workout queries AND mutations
  /exercises.ts    - Exercise queries AND mutations
  /user.ts         - User queries AND mutations
```

### Drizzle ORM Required

**ALL database mutations MUST use Drizzle ORM.**

❌ **NEVER use raw SQL:**
```typescript
// WRONG - DO NOT DO THIS
await db.execute(sql`INSERT INTO workouts (name, user_id) VALUES (${name}, ${userId})`);
```

✅ **ALWAYS use Drizzle ORM:**
```typescript
// CORRECT
import { db } from '@/db';
import { workouts } from '@/db/schema';

export async function createWorkoutForUser(
  userId: string,
  data: { name: string; date: Date; notes?: string }
) {
  const result = await db
    .insert(workouts)
    .values({
      name: data.name,
      startedAt: data.date,
      notes: data.notes,
      userId, // CRITICAL: Always set userId
    })
    .returning();

  return result[0];
}
```

### Data Helper Pattern Examples

#### Insert (Create)
```typescript
// src/data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';

export async function createWorkoutForUser(
  userId: string,
  data: { name: string; date: Date }
) {
  const result = await db
    .insert(workouts)
    .values({
      ...data,
      userId,
    })
    .returning();

  return result[0];
}
```

#### Update
```typescript
// src/data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function updateWorkoutForUser(
  userId: string,
  workoutId: string,
  data: { name?: string; notes?: string }
) {
  const result = await db
    .update(workouts)
    .set(data)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId) // CRITICAL: Always filter by userId
      )
    )
    .returning();

  return result[0];
}
```

#### Delete
```typescript
// src/data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function deleteWorkoutForUser(userId: string, workoutId: string) {
  await db
    .delete(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId) // CRITICAL: Always filter by userId
      )
    );
}
```

## 🔒 Security: User Data Isolation

**CRITICAL SECURITY REQUIREMENT:**

Every data mutation function MUST ensure that:
1. The current logged-in user can ONLY modify their own data
2. Users CANNOT modify data belonging to other users
3. All mutations MUST filter by the authenticated user's ID

### Server Action Security Pattern

```typescript
// src/app/workouts/actions.ts
'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { deleteWorkoutForUser } from '@/data/workouts';

const deleteWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
});

type DeleteWorkoutInput = z.infer<typeof deleteWorkoutSchema>;

export async function deleteWorkout(input: DeleteWorkoutInput) {
  // 1. Validate input
  const validated = deleteWorkoutSchema.parse(input);

  // 2. CRITICAL: Authenticate user
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // 3. Pass userId to data helper (ensures user can only delete their own data)
  await deleteWorkoutForUser(userId, validated.workoutId);

  // 4. Revalidate
  revalidatePath('/workouts');
}
```

## Complete Example: Full Mutation Flow

### 1. Data Helper (`src/data/exercises.ts`)

```typescript
import { db } from '@/db';
import { exercises } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function createExerciseForUser(
  userId: string,
  data: { name: string; muscleGroup: string }
) {
  const result = await db
    .insert(exercises)
    .values({
      ...data,
      userId,
    })
    .returning();

  return result[0];
}

export async function updateExerciseForUser(
  userId: string,
  exerciseId: string,
  data: { name?: string; muscleGroup?: string }
) {
  const result = await db
    .update(exercises)
    .set(data)
    .where(
      and(
        eq(exercises.id, exerciseId),
        eq(exercises.userId, userId)
      )
    )
    .returning();

  return result[0];
}

export async function deleteExerciseForUser(userId: string, exerciseId: string) {
  await db
    .delete(exercises)
    .where(
      and(
        eq(exercises.id, exerciseId),
        eq(exercises.userId, userId)
      )
    );
}
```

### 2. Server Actions (`src/app/exercises/actions.ts`)

```typescript
'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import {
  createExerciseForUser,
  updateExerciseForUser,
  deleteExerciseForUser,
} from '@/data/exercises';

// Schemas
const createExerciseSchema = z.object({
  name: z.string().min(1).max(100),
  muscleGroup: z.string().min(1).max(50),
});

const updateExerciseSchema = z.object({
  exerciseId: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  muscleGroup: z.string().min(1).max(50).optional(),
});

const deleteExerciseSchema = z.object({
  exerciseId: z.string().uuid(),
});

// Types
type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;
type DeleteExerciseInput = z.infer<typeof deleteExerciseSchema>;

// Actions
export async function createExercise(input: CreateExerciseInput) {
  const validated = createExerciseSchema.parse(input);

  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  await createExerciseForUser(userId, validated);
  revalidatePath('/exercises');
}

export async function updateExercise(input: UpdateExerciseInput) {
  const validated = updateExerciseSchema.parse(input);

  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const { exerciseId, ...data } = validated;
  await updateExerciseForUser(userId, exerciseId, data);
  revalidatePath('/exercises');
}

export async function deleteExercise(input: DeleteExerciseInput) {
  const validated = deleteExerciseSchema.parse(input);

  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  await deleteExerciseForUser(userId, validated.exerciseId);
  revalidatePath('/exercises');
}
```

### 3. Client Component Usage

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { createExercise, deleteExercise } from './actions';

export function ExerciseForm() {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Convert FormData to typed object BEFORE calling server action
    await createExercise({
      name: formData.get('name') as string,
      muscleGroup: formData.get('muscleGroup') as string,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}

export function DeleteExerciseButton({ exerciseId }: { exerciseId: string }) {
  async function handleDelete() {
    await deleteExercise({ exerciseId });
  }

  return (
    <Button variant="destructive" onClick={handleDelete}>
      Delete
    </Button>
  );
}
```

## Error Handling

### Validation Errors

Use Zod's `safeParse` for user-friendly error handling:

```typescript
'use server';

import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export async function createItem(input: { name: string }) {
  const result = schema.safeParse(input);

  if (!result.success) {
    return {
      error: result.error.errors[0].message,
    };
  }

  // Proceed with validated data
  const validated = result.data;
  // ...
}
```

## Security Checklist

Before implementing any data mutation, verify:

- [ ] Is the mutation in a colocated `actions.ts` file?
- [ ] Does the server action use `'use server'` directive?
- [ ] Are parameters typed (NOT `FormData`)?
- [ ] Is input validated with Zod?
- [ ] Does the action call `auth()` to get the current user?
- [ ] Does the action check if `userId` exists?
- [ ] Does the data helper exist in `/src/data` directory?
- [ ] Does the data helper use Drizzle ORM (NOT raw SQL)?
- [ ] Does the data helper filter by `userId` for updates/deletes?
- [ ] Is `revalidatePath` called after the mutation?
- [ ] Does the action return data instead of calling `redirect()`?
- [ ] Is navigation handled client-side with `useRouter`?

## Common Mistakes to Avoid

### ❌ Don't use FormData parameters
```typescript
// WRONG
export async function createWorkout(formData: FormData) {
  // ...
}
```

### ❌ Don't skip Zod validation
```typescript
// WRONG
export async function createWorkout(input: { name: string }) {
  // Missing validation!
  await createWorkoutForUser(userId, input);
}
```

### ❌ Don't put actions in a centralized file
```typescript
// WRONG - Don't create src/actions/index.ts or similar
// Actions should be colocated with their pages
```

### ❌ Don't call the database directly in server actions
```typescript
// WRONG
'use server';

export async function createWorkout(input: CreateWorkoutInput) {
  // Don't do DB calls here - use data helpers
  await db.insert(workouts).values({ ... });
}
```

### ❌ Don't use redirect() in server actions
```typescript
// WRONG
'use server';

import { redirect } from 'next/navigation';

export async function createWorkout(input: CreateWorkoutInput) {
  // ... mutation logic
  redirect('/workouts'); // Don't redirect from server actions
}
```

### ✅ Do use the proper pattern
```typescript
// CORRECT
'use server';

export async function createWorkout(input: CreateWorkoutInput) {
  const validated = schema.parse(input);
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  // Call data helper
  await createWorkoutForUser(userId, validated);
  revalidatePath('/workouts');
}
```

## Summary

**Remember the golden rule:**
> Server Action (colocated `actions.ts`) → Zod validation → Auth check → Data helper (`/src/data`) → Drizzle ORM → User's own data only

Any deviation from this pattern is a violation of project architecture and security requirements.
