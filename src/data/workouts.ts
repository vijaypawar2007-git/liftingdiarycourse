import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, and, gte, lt, desc } from 'drizzle-orm';

/**
 * Get all workouts for the currently authenticated user
 */
export async function getUserWorkouts() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const result = await db.query.workouts.findMany({
    where: eq(workouts.userId, userId),
    with: {
      workoutExercises: {
        with: {
          exercise: true,
          sets: {
            orderBy: (sets, { asc }) => [asc(sets.setNumber)],
          },
        },
        orderBy: (workoutExercises, { asc }) => [asc(workoutExercises.order)],
      },
    },
    orderBy: desc(workouts.createdAt),
  });

  return result;
}

/**
 * Get workouts for the currently authenticated user filtered by a specific date
 * @param date - The date to filter workouts by (filters by startedAt date)
 */
export async function getUserWorkoutsByDate(date: Date) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Set the date range to the entire day (00:00:00 to 23:59:59)
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await db.query.workouts.findMany({
    where: and(
      eq(workouts.userId, userId),
      gte(workouts.startedAt, startOfDay),
      lt(workouts.startedAt, endOfDay)
    ),
    with: {
      workoutExercises: {
        with: {
          exercise: true,
          sets: {
            orderBy: (sets, { asc }) => [asc(sets.setNumber)],
          },
        },
        orderBy: (workoutExercises, { asc }) => [asc(workoutExercises.order)],
      },
    },
    orderBy: desc(workouts.startedAt),
  });

  return result;
}

/**
 * Create a new workout for a user
 * @param userId - The user ID to create the workout for
 * @param data - The workout data
 */
export async function createWorkoutForUser(
  userId: string,
  data: { name: string; startedAt: Date }
) {
  const result = await db
    .insert(workouts)
    .values({
      userId,
      name: data.name,
      startedAt: data.startedAt,
    })
    .returning();

  return result[0];
}

/**
 * Get a single workout by ID for the currently authenticated user
 * @param workoutId - The workout ID to fetch
 */
export async function getUserWorkoutById(workoutId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const result = await db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
    with: {
      workoutExercises: {
        with: {
          exercise: true,
          sets: {
            orderBy: (sets, { asc }) => [asc(sets.setNumber)],
          },
        },
        orderBy: (workoutExercises, { asc }) => [asc(workoutExercises.order)],
      },
    },
  });

  return result;
}

/**
 * Update an existing workout for a user
 * @param userId - The user ID (for authorization)
 * @param workoutId - The workout ID to update
 * @param data - The workout data to update
 */
export async function updateWorkoutForUser(
  userId: string,
  workoutId: string,
  data: { name?: string; startedAt?: Date }
) {
  const result = await db
    .update(workouts)
    .set(data)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();

  return result[0];
}
