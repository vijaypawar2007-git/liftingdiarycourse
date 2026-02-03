'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { updateWorkoutForUser } from '@/data/workouts';
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
