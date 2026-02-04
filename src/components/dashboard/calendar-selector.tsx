'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);

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
      setIsOpen(false); // Close popover after selection
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[240px] justify-start text-left font-normal"
          aria-label={`Select date, currently showing ${formatDate(selectedDate)}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{formatDate(selectedDate)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          timeZone="UTC"
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
