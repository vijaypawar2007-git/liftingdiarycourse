'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, parseLocalDate, formatLocalDate } from '@/lib/date-utils';

export function CalendarSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get date from URL or default to today
  const dateParam = searchParams.get('date');
  const selectedDate = dateParam ? parseLocalDate(dateParam) : new Date();

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Update URL with the selected date in local timezone
      const params = new URLSearchParams(searchParams);
      params.set('date', formatLocalDate(date));
      router.push(`/dashboard?${params.toString()}`);
    }
  };

  return (
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
          onSelect={handleDateSelect}
          className="rounded-md border"
        />
      </CardContent>
    </Card>
  );
}
