import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  numeric,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Workouts Table - Stores workout sessions
export const workouts = pgTable(
  'workouts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    name: text('name'),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: index('workouts_user_id_idx').on(table.userId),
    createdAtIdx: index('workouts_created_at_idx').on(table.createdAt),
  })
);

// Exercises Table - Master exercise library (reusable)
export const exercises = pgTable(
  'exercises',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    createdBy: text('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    nameIdx: index('exercises_name_idx').on(table.name),
    createdByIdx: index('exercises_created_by_idx').on(table.createdBy),
  })
);

// WorkoutExercises Table - Junction table linking workouts to exercises
export const workoutExercises = pgTable(
  'workout_exercises',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workoutId: uuid('workout_id')
      .notNull()
      .references(() => workouts.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'restrict' }),
    order: integer('order').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    workoutIdIdx: index('workout_exercises_workout_id_idx').on(table.workoutId),
    workoutOrderIdx: index('workout_exercises_workout_order_idx').on(
      table.workoutId,
      table.order
    ),
  })
);

// Sets Table - Individual sets within workout exercises
export const sets = pgTable(
  'sets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workoutExerciseId: uuid('workout_exercise_id')
      .notNull()
      .references(() => workoutExercises.id, { onDelete: 'cascade' }),
    setNumber: integer('set_number').notNull(),
    reps: integer('reps'),
    weight: numeric('weight', { precision: 10, scale: 2 }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    workoutExerciseIdIdx: index('sets_workout_exercise_id_idx').on(
      table.workoutExerciseId
    ),
    workoutExerciseSetIdx: index('sets_workout_exercise_set_idx').on(
      table.workoutExerciseId,
      table.setNumber
    ),
  })
);

// Relations
export const workoutsRelations = relations(workouts, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const exercisesRelations = relations(exercises, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(
  workoutExercises,
  ({ one, many }) => ({
    workout: one(workouts, {
      fields: [workoutExercises.workoutId],
      references: [workouts.id],
    }),
    exercise: one(exercises, {
      fields: [workoutExercises.exerciseId],
      references: [exercises.id],
    }),
    sets: many(sets),
  })
);

export const setsRelations = relations(sets, ({ one }) => ({
  workoutExercise: one(workoutExercises, {
    fields: [sets.workoutExerciseId],
    references: [workoutExercises.id],
  }),
}));

// Type exports for use in the application
export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert;
export type Set = typeof sets.$inferSelect;
export type NewSet = typeof sets.$inferInsert;
