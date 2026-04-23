import { differenceInCalendarDays, format, startOfDay } from 'date-fns';

type DateFormatFn = (date: Date | string, short?: boolean) => string;

/**
 * @param {Date|string} date A valid Date object or ISO string
 * @param {boolean=} short Render only Today/Tomorrow/Yesterday if valid. Defaults to false
 */
export const formatDate: DateFormatFn = (date, short) => {
  const d = new Date(date);
  const diff = differenceInCalendarDays(startOfDay(new Date()), startOfDay(d));
  switch (diff) {
    case 0:
      return short ? 'Today' : `Today, ${format(d, 'dd MMM yyyy')}`;
    case -1:
      return short ? 'Tomorrow' : `Tomorrow, ${format(d, 'dd MMM yyyy')}`;
    case 1:
      return short ? 'Yesterday' : `Yesterday, ${format(d, 'dd MMM yyyy')}`;
    default:
      return format(d, 'eee, dd MMM yyyy');
  }
};

/**
 * Returns the time portion of a date in the local time in the format H:MM AM/PM
 *
 * == Examples
 * * `T15:36:45.000Z` => 3:36 PM (if in +0:00 offset)
 */
export const formatTime: DateFormatFn = (date) => {
  return format(new Date(date), 'h:mm a');
};

export const formatDateAndTime: DateFormatFn = (date, short) => {
  return `${formatDate(date, short)} at ${formatTime(date)}`;
};
