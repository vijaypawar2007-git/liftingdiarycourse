'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { createWorkoutForUser } from '@/data/workouts';
import { formatLocalDate } from '@/lib/date-utils';

const createWorkoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required').max(100, 'Workout name must be 100 characters or less'),
  startedAt: z.coerce.date(),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

type FieldErrors = {
  name?: string;
  startedAt?: string;
};

type CreateWorkoutResult =
  | { success: true; redirectUrl: string }
  | { success: false; fieldErrors: FieldErrors };

export async function createWorkout(input: CreateWorkoutInput): Promise<CreateWorkoutResult> {
  const result = createWorkoutSchema.safeParse(input);

  if (!result.success) {
    const fieldErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof FieldErrors;
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return { success: false, fieldErrors };
  }

  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  await createWorkoutForUser(userId, {
    name: result.data.name,
    startedAt: result.data.startedAt,
  });

  const dateString = formatLocalDate(result.data.startedAt);
  revalidatePath('/dashboard');

  return { success: true, redirectUrl: `/dashboard?date=${dateString}` };
}
