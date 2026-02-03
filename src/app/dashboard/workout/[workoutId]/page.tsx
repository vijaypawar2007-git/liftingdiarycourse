import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EditWorkoutForm } from './edit-workout-form';
import { getUserWorkoutById } from '@/data/workouts';
import { formatLocalDate } from '@/lib/date-utils';

interface EditWorkoutPageProps {
  params: Promise<{ workoutId: string }>;
}

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const { workoutId } = await params;

  const workout = await getUserWorkoutById(workoutId);

  if (!workout) {
    notFound();
  }

  const dateString = formatLocalDate(workout.startedAt ?? new Date());

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Edit Workout
          </h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            Update your workout details
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Workout Details</CardTitle>
            <CardDescription>
              Modify the details for your workout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditWorkoutForm
              workoutId={workout.id}
              defaultName={workout.name ?? ''}
              defaultDate={dateString}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
