'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateWorkout } from './actions';
import { parseLocalDate } from '@/lib/date-utils';

interface EditWorkoutFormProps {
  workoutId: string;
  defaultName: string;
  defaultDate: string;
}

type FieldErrors = {
  name?: string;
  startedAt?: string;
};

export function EditWorkoutForm({ workoutId, defaultName, defaultDate }: EditWorkoutFormProps) {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const dateString = formData.get('date') as string;
    const date = parseLocalDate(dateString);

    const result = await updateWorkout({
      workoutId,
      name: formData.get('name') as string,
      startedAt: date,
    });

    if (result.success) {
      router.push(result.redirectUrl);
    } else {
      setFieldErrors(result.fieldErrors);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Workout Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={defaultName}
          placeholder="e.g., Morning Push Day"
          maxLength={100}
          className={fieldErrors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
        />
        {fieldErrors.name && (
          <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={defaultDate}
          className={fieldErrors.startedAt ? 'border-red-500 focus-visible:ring-red-500' : ''}
        />
        {fieldErrors.startedAt && (
          <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.startedAt}</p>
        )}
      </div>

      <div className="flex gap-4">
        <Button type="submit">Save Changes</Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
