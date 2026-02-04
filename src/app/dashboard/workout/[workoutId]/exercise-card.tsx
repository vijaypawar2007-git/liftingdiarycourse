'use client';

import { useState } from 'react';
import { WorkoutExercise, Exercise, Set } from '@/db/schema';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { SetsTable } from './sets-table';
import { AddSetDialog } from './add-set-dialog';
import { removeExerciseAction } from './actions';

interface ExerciseCardProps {
  workoutExercise: WorkoutExercise & {
    exercise: Exercise;
    sets: Set[];
  };
  workoutId: string;
}

export function ExerciseCard({ workoutExercise, workoutId }: ExerciseCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function handleDelete() {
    await removeExerciseAction({ workoutExerciseId: workoutExercise.id });
    setShowDeleteDialog(false);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">
            {workoutExercise.exercise.name}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
            className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <SetsTable sets={workoutExercise.sets} workoutExerciseId={workoutExercise.id} />
        </CardContent>
        <CardFooter>
          <AddSetDialog workoutExerciseId={workoutExercise.id} />
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Exercise</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &quot;{workoutExercise.exercise.name}&quot; from this workout?
              This will also delete all sets for this exercise. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
