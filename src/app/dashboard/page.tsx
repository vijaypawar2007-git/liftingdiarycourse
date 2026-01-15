'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/date-utils';

// Mock workout data for UI demonstration
const mockWorkouts = [
  {
    id: 1,
    name: 'Push Day',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 8 },
      { name: 'Overhead Press', sets: 3, reps: 10 },
      { name: 'Tricep Dips', sets: 3, reps: 12 },
    ],
  },
  {
    id: 2,
    name: 'Legs',
    exercises: [
      { name: 'Squats', sets: 5, reps: 5 },
      { name: 'Romanian Deadlifts', sets: 3, reps: 10 },
      { name: 'Leg Press', sets: 4, reps: 12 },
    ],
  },
];

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
                <CardDescription>
                  {formatDate(selectedDate)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
          </div>

          {/* Workouts List Section */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                Workouts for {formatDate(selectedDate)}
              </h2>
            </div>

            {mockWorkouts.length > 0 ? (
              <div className="space-y-4">
                {mockWorkouts.map((workout) => (
                  <Card key={workout.id}>
                    <CardHeader>
                      <CardTitle>{workout.name}</CardTitle>
                      <CardDescription>
                        {workout.exercises.length} exercises
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {workout.exercises.map((exercise, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900"
                          >
                            <span className="font-medium text-zinc-900 dark:text-zinc-50">
                              {exercise.name}
                            </span>
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                              {exercise.sets} × {exercise.reps}
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
