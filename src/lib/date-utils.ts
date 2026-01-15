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
