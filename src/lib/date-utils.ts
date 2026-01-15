import { format } from 'date-fns';

const getOrdinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

export const formatDate = (date: Date): string => {
  const day = format(date, 'd');
  const month = format(date, 'MMM');
  const year = format(date, 'yyyy');

  const suffix = getOrdinalSuffix(parseInt(day));

  return `${day}${suffix} ${month} ${year}`;
};

/**
 * Parses an ISO date string (YYYY-MM-DD) into a Date object in the local timezone.
 * This avoids timezone issues when creating dates from URL parameters.
 */
export const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
};

/**
 * Formats a Date object to YYYY-MM-DD string in the local timezone.
 * This avoids timezone issues when converting dates to URL parameters.
 */
export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
