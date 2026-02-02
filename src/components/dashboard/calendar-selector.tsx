'use client';

import { useRouter } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/date-utils';

interface CalendarSelectorProps {
  /** The currently selected date string in YYYY-MM-DD format */
  selectedDateString: string;
}

/**
 * Parses a YYYY-MM-DD string into a Date at midnight UTC.
 * This matches react-day-picker's UTC timezone mode.
 */
function parseDateParamUTC(dateString: string): Date {
  return new Date(dateString + 'T00:00:00.000Z');
}

export function CalendarSelector({ selectedDateString }: CalendarSelectorProps) {
  const router = useRouter();

  // Parse the date string passed from the server component
  const selectedDate = parseDateParamUTC(selectedDateString);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // react-day-picker creates dates at midnight UTC, so we need to use
      // UTC methods to extract the actual date the user clicked on
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      router.push(`/dashboard?date=${dateString}`);
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
          timeZone="UTC"
          className="rounded-md border"
        />
      </CardContent>
    </Card>
  );
}
