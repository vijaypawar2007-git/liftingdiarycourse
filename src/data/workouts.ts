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
