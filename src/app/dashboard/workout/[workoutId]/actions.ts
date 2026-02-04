'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import {
  updateWorkoutForUser,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  addSetToWorkoutExercise,
  updateSet,
  deleteSet,
} from '@/data/workouts';
import { createExercise } from '@/data/exercises';
import { formatLocalDate } from '@/lib/date-utils';

const updateWorkoutSchema = z.object({
  workoutId: z.string().uuid('Invalid workout ID'),
  name: z.string().min(1, 'Workout name is required').max(100, 'Workout name must be 100 characters or less'),
  startedAt: z.coerce.date(),
});

type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;

type FieldErrors = {
  name?: string;
  startedAt?: string;
};

type UpdateWorkoutResult =
  | { success: true; redirectUrl: string }
  | { success: false; fieldErrors: FieldErrors };

export async function updateWorkout(input: UpdateWorkoutInput): Promise<UpdateWorkoutResult> {
  const result = updateWorkoutSchema.safeParse(input);

  if (!result.success) {
    const fieldErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof FieldErrors;
      if (field === 'name' || field === 'startedAt') {
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
    }
    return { success: false, fieldErrors };
  }

  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  await updateWorkoutForUser(userId, result.data.workoutId, {
    name: result.data.name,
    startedAt: result.data.startedAt,
  });

  const dateString = formatLocalDate(result.data.startedAt);
  revalidatePath('/dashboard');

  return { success: true, redirectUrl: `/dashboard?date=${dateString}` };
}

// ========== Exercise and Set Management Actions ==========

// Schemas
const addExerciseToWorkoutSchema = z.object({
  workoutId: z.string().uuid('Invalid workout ID'),
  exerciseId: z.string().uuid('Invalid exercise ID'),
});

const removeExerciseSchema = z.object({
  workoutExerciseId: z.string().uuid('Invalid workout exercise ID'),
});

const createExerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required').max(100, 'Exercise name must be 100 characters or less'),
});

const addSetSchema = z.object({
  workoutExerciseId: z.string().uuid('Invalid workout exercise ID'),
  reps: z.number().int().min(0).max(999).optional(),
  weight: z.number().min(0).max(9999.99).optional(),
});

const updateSetSchema = z.object({
  setId: z.string().uuid('Invalid set ID'),
  reps: z.number().int().min(0).max(999).optional(),
  weight: z.number().min(0).max(9999.99).optional(),
});

const deleteSetSchema = z.object({
  setId: z.string().uuid('Invalid set ID'),
});

// Types
type AddExerciseToWorkoutInput = z.infer<typeof addExerciseToWorkoutSchema>;
type RemoveExerciseInput = z.infer<typeof removeExerciseSchema>;
type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
type AddSetInput = z.infer<typeof addSetSchema>;
type UpdateSetInput = z.infer<typeof updateSetSchema>;
type DeleteSetInput = z.infer<typeof deleteSetSchema>;

type ActionResult =
  | { success: true }
  | { success: false; error: string };

type CreateExerciseResult =
  | { success: true; exerciseId: string }
  | { success: false; error: string };

// Actions

/**
 * Add an exercise to a workout
 */
export async function addExerciseToWorkoutAction(
  input: AddExerciseToWorkoutInput
): Promise<ActionResult> {
  const result = addExerciseToWorkoutSchema.safeParse(input);

  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? 'Validation failed' };
  }

  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await addExerciseToWorkout(userId, result.data.workoutId, result.data.exerciseId);
    revalidatePath(`/dashboard/workout/${result.data.workoutId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to add exercise' };
  }
}

/**
 * Remove an exercise from a workout
 */
export async function removeExerciseAction(
  input: RemoveExerciseInput
): Promise<ActionResult> {
  const result = removeExerciseSchema.safeParse(input);

  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? 'Validation failed' };
  }

  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await removeExerciseFromWorkout(userId, result.data.workoutExerciseId);
    // We need to get workoutId for revalidation - for now revalidate the dashboard
    revalidatePath('/dashboard/workout');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to remove exercise' };
  }
}

/**
 * Create a new exercise in the master library
 */
export async function createExerciseAction(
  input: CreateExerciseInput
): Promise<CreateExerciseResult> {
  const result = createExerciseSchema.safeParse(input);

  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? 'Validation failed' };
  }

  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const exercise = await createExercise(userId, result.data.name);
    return { success: true, exerciseId: exercise.id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create exercise' };
  }
}

/**
 * Add a set to a workout exercise
 */
export async function addSetAction(
  input: AddSetInput
): Promise<ActionResult> {
  const result = addSetSchema.safeParse(input);

  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? 'Validation failed' };
  }

  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await addSetToWorkoutExercise(userId, result.data.workoutExerciseId, {
      reps: result.data.reps,
      weight: result.data.weight,
    });
    revalidatePath('/dashboard/workout');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to add set' };
  }
}

/**
 * Update a set
 */
export async function updateSetAction(
  input: UpdateSetInput
): Promise<ActionResult> {
  const result = updateSetSchema.safeParse(input);

  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? 'Validation failed' };
  }

  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await updateSet(userId, result.data.setId, {
      reps: result.data.reps,
      weight: result.data.weight,
    });
    revalidatePath('/dashboard/workout');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update set' };
  }
}

/**
 * Delete a set
 */
export async function deleteSetAction(
  input: DeleteSetInput
): Promise<ActionResult> {
  const result = deleteSetSchema.safeParse(input);

  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? 'Validation failed' };
  }

  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await deleteSet(userId, result.data.setId);
    revalidatePath('/dashboard/workout');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete set' };
  }
}
