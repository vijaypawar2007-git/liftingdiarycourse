import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, parseLocalDate, formatLocalDate } from '@/lib/date-utils';
import { CalendarSelector } from '@/components/dashboard/calendar-selector';
import { getUserWorkoutsByDate } from '@/data/workouts';

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const dateParam = params.date;

  // Get selected date from URL or default to today
  const selectedDate = dateParam ? parseLocalDate(dateParam) : new Date();

  // Fetch workouts for the selected date
  const workouts = await getUserWorkoutsByDate(selectedDate);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Workout Dashboard
          </h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            Track and manage your workouts
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Date Picker Section */}
          <div className="lg:col-span-1">
            <CalendarSelector selectedDateString={formatLocalDate(selectedDate)} />
          </div>

          {/* Workouts List Section */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                Workouts for {formatDate(selectedDate)}
              </h2>
              <Button asChild>
                <Link href={`/dashboard/workout/new?date=${formatLocalDate(selectedDate)}`}>
                  New Workout
                </Link>
              </Button>
            </div>

            {workouts.length > 0 ? (
              <div className="space-y-4">
                {workouts.map((workout) => (
                  <Card key={workout.id}>
                    <CardHeader>
                      <CardTitle>{workout.name || 'Untitled Workout'}</CardTitle>
                      <CardDescription>
                        {workout.workoutExercises.length} exercise{workout.workoutExercises.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {workout.workoutExercises.map((workoutExercise) => (
                          <div
                            key={workoutExercise.id}
                            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900"
                          >
                            <span className="font-medium text-zinc-900 dark:text-zinc-50">
                              {workoutExercise.exercise.name}
                            </span>
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                              {workoutExercise.sets.length} set{workoutExercise.sets.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex min-h-[200px] items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                      No workouts logged
                    </p>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      Start by adding your first workout for this date
                    </p>
                    <Button asChild className="mt-4">
                      <Link href={`/dashboard/workout/new?date=${formatLocalDate(selectedDate)}`}>
                        Create New Workout
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
