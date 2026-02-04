'use client';

import { Workout, WorkoutExercise, Exercise, Set } from '@/db/schema';
import { ExerciseCard } from './exercise-card';
import { AddExerciseDialog } from './add-exercise-dialog';

interface WorkoutExercisesListProps {
  workout: Workout & {
    workoutExercises: (WorkoutExercise & {
      exercise: Exercise;
      sets: Set[];
    })[];
  };
  exercises: Exercise[];
}

export function WorkoutExercisesList({ workout, exercises }: WorkoutExercisesListProps) {
  if (workout.workoutExercises.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">
            No exercises yet. Add your first exercise to get started.
          </p>
          <AddExerciseDialog workoutId={workout.id} exercises={exercises} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <AddExerciseDialog workoutId={workout.id} exercises={exercises} />
      </div>

      <div className="space-y-4">
        {workout.workoutExercises.map((workoutExercise) => (
          <ExerciseCard
            key={workoutExercise.id}
            workoutExercise={workoutExercise}
            workoutId={workout.id}
          />
        ))}
      </div>
    </div>
  );
}
