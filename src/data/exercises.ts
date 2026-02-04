import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { exercises } from '@/db/schema';
import { asc } from 'drizzle-orm';

/**
 * Get all exercises from the master library
 * Note: Exercises are a shared library visible to all users
 */
export async function getAllExercises() {
  const result = await db.query.exercises.findMany({
    orderBy: asc(exercises.name),
  });

  return result;
}

/**
 * Create a new exercise in the master library
 * @param userId - The user ID creating the exercise
 * @param name - The name of the exercise
 */
export async function createExercise(userId: string, name: string) {
  const result = await db
    .insert(exercises)
    .values({
      name,
      createdBy: userId,
    })
    .returning();

  return result[0];
}
