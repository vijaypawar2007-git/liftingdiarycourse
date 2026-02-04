'use client';

import { useState } from 'react';
import { Exercise } from '@/db/schema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { addExerciseToWorkoutAction, createExerciseAction } from './actions';

interface AddExerciseDialogProps {
  workoutId: string;
  exercises: Exercise[];
}

export function AddExerciseDialog({ workoutId, exercises }: AddExerciseDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [newExerciseName, setNewExerciseName] = useState('');
  const [showNewExerciseForm, setShowNewExerciseForm] = useState(false);
  const [error, setError] = useState('');

  async function handleAddExisting() {
    if (!selectedExerciseId) {
      setError('Please select an exercise');
      return;
    }

    setError('');
    const result = await addExerciseToWorkoutAction({
      workoutId,
      exerciseId: selectedExerciseId,
    });

    if (result.success) {
      setSelectedExerciseId('');
      setOpen(false);
    } else {
      setError(result.error);
    }
  }

  async function handleCreateNew(e: React.FormEvent) {
    e.preventDefault();
    if (!newExerciseName.trim()) {
      setError('Please enter an exercise name');
      return;
    }

    setError('');

    // First create the exercise
    const createResult = await createExerciseAction({ name: newExerciseName.trim() });

    if (!createResult.success) {
      setError(createResult.error);
      return;
    }

    // Then add it to the workout
    const addResult = await addExerciseToWorkoutAction({
      workoutId,
      exerciseId: createResult.exerciseId,
    });

    if (addResult.success) {
      setNewExerciseName('');
      setShowNewExerciseForm(false);
      setOpen(false);
    } else {
      setError(addResult.error);
    }
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset state when closing
      setSelectedExerciseId('');
      setNewExerciseName('');
      setShowNewExerciseForm(false);
      setError('');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Exercise
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Exercise</DialogTitle>
          <DialogDescription>
            Choose an existing exercise or create a new one.
          </DialogDescription>
        </DialogHeader>

        {!showNewExerciseForm ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="exercise">Select Exercise</Label>
              <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                <SelectTrigger id="exercise">
                  <SelectValue placeholder="Choose an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <Separator />

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowNewExerciseForm(true)}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Exercise
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreateNew}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-exercise-name">Exercise Name</Label>
                <Input
                  id="new-exercise-name"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  placeholder="e.g., Bench Press"
                  maxLength={100}
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowNewExerciseForm(false);
                  setNewExerciseName('');
                  setError('');
                }}
              >
                Back
              </Button>
              <Button type="submit">Create and Add</Button>
            </DialogFooter>
          </form>
        )}

        {!showNewExerciseForm && (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddExisting}>
              Add Exercise
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
