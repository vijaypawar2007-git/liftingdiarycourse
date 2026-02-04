import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { workouts, workoutExercises, sets } from '@/db/schema';
import { eq, and, gte, lt, desc, asc } from 'drizzle-orm';

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

/**
 * Add an exercise to a workout
 * @param userId - The user ID (for authorization)
 * @param workoutId - The workout ID to add the exercise to
 * @param exerciseId - The exercise ID to add
 */
export async function addExerciseToWorkout(
  userId: string,
  workoutId: string,
  exerciseId: string
) {
  // First verify the workout belongs to the user
  const workout = await db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
  });

  if (!workout) {
    throw new Error('Workout not found or unauthorized');
  }

  // Get the max order for exercises in this workout
  const existingExercises = await db.query.workoutExercises.findMany({
    where: eq(workoutExercises.workoutId, workoutId),
    orderBy: desc(workoutExercises.order),
    limit: 1,
  });

  const maxOrder = existingExercises[0]?.order ?? -1;

  // Insert the new workout exercise
  const result = await db
    .insert(workoutExercises)
    .values({
      workoutId,
      exerciseId,
      order: maxOrder + 1,
    })
    .returning();

  return result[0];
}

/**
 * Remove an exercise from a workout
 * @param userId - The user ID (for authorization)
 * @param workoutExerciseId - The workout exercise ID to remove
 */
export async function removeExerciseFromWorkout(
  userId: string,
  workoutExerciseId: string
) {
  // Verify the workout belongs to the user via JOIN
  const workoutExercise = await db.query.workoutExercises.findFirst({
    where: eq(workoutExercises.id, workoutExerciseId),
    with: {
      workout: true,
    },
  });

  if (!workoutExercise || workoutExercise.workout.userId !== userId) {
    throw new Error('Workout exercise not found or unauthorized');
  }

  // Delete the workout exercise (sets will cascade delete automatically)
  await db
    .delete(workoutExercises)
    .where(eq(workoutExercises.id, workoutExerciseId));
}

/**
 * Add a set to a workout exercise
 * @param userId - The user ID (for authorization)
 * @param workoutExerciseId - The workout exercise ID to add the set to
 * @param data - The set data (reps and/or weight)
 */
export async function addSetToWorkoutExercise(
  userId: string,
  workoutExerciseId: string,
  data: { reps?: number; weight?: number }
) {
  // Verify the workout belongs to the user via JOINs
  const workoutExercise = await db.query.workoutExercises.findFirst({
    where: eq(workoutExercises.id, workoutExerciseId),
    with: {
      workout: true,
    },
  });

  if (!workoutExercise || workoutExercise.workout.userId !== userId) {
    throw new Error('Workout exercise not found or unauthorized');
  }

  // Get the max set number for this workout exercise
  const existingSets = await db.query.sets.findMany({
    where: eq(sets.workoutExerciseId, workoutExerciseId),
    orderBy: desc(sets.setNumber),
    limit: 1,
  });

  const maxSetNumber = existingSets[0]?.setNumber ?? 0;

  // Insert the new set
  const result = await db
    .insert(sets)
    .values({
      workoutExerciseId,
      setNumber: maxSetNumber + 1,
      reps: data.reps,
      weight: data.weight ? data.weight.toString() : null,
    })
    .returning();

  return result[0];
}

/**
 * Update a set
 * @param userId - The user ID (for authorization)
 * @param setId - The set ID to update
 * @param data - The set data to update (reps and/or weight)
 */
export async function updateSet(
  userId: string,
  setId: string,
  data: { reps?: number; weight?: number }
) {
  // Verify the workout belongs to the user via JOINs
  const set = await db.query.sets.findFirst({
    where: eq(sets.id, setId),
    with: {
      workoutExercise: {
        with: {
          workout: true,
        },
      },
    },
  });

  if (!set || set.workoutExercise.workout.userId !== userId) {
    throw new Error('Set not found or unauthorized');
  }

  // Update the set
  const result = await db
    .update(sets)
    .set({
      reps: data.reps,
      weight: data.weight !== undefined ? data.weight.toString() : undefined,
    })
    .where(eq(sets.id, setId))
    .returning();

  return result[0];
}

/**
 * Delete a set
 * @param userId - The user ID (for authorization)
 * @param setId - The set ID to delete
 */
export async function deleteSet(userId: string, setId: string) {
  // Verify the workout belongs to the user via JOINs
  const set = await db.query.sets.findFirst({
    where: eq(sets.id, setId),
    with: {
      workoutExercise: {
        with: {
          workout: true,
        },
      },
    },
  });

  if (!set || set.workoutExercise.workout.userId !== userId) {
    throw new Error('Set not found or unauthorized');
  }

  // Delete the set
  await db.delete(sets).where(eq(sets.id, setId));
}
