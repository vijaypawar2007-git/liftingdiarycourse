import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NewWorkoutForm } from './new-workout-form';
import { formatLocalDate, parseLocalDate } from '@/lib/date-utils';

// Force dynamic rendering - this page is behind authentication
export const dynamic = 'force-dynamic';

interface NewWorkoutPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function NewWorkoutPage({ searchParams }: NewWorkoutPageProps) {
  const params = await searchParams;
  const dateParam = params.date;

  const selectedDate = dateParam ? parseLocalDate(dateParam) : new Date();
  const dateString = formatLocalDate(selectedDate);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            New Workout
          </h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            Create a new workout session
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Workout Details</CardTitle>
            <CardDescription>
              Enter the details for your new workout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewWorkoutForm defaultDate={dateString} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
