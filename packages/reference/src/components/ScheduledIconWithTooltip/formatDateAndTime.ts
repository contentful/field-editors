// eslint-disable-next-line -- TODO: describe this disable  no-restricted-imports
import moment from 'moment';

type DateFormatFn = (date: Date | string, short?: boolean) => string;

/**
 * @param {Date|string} date A valid constructor argument for moment()
 * @param {boolean=} short Render only Today/Tomorrow/Yesterday if valid. Defaults to false
 */
export const formatDate: DateFormatFn = (date, short) => {
  switch (moment().startOf('day').diff(moment(date).startOf('day'), 'days')) {
    case 0:
      return short ? 'Today' : `Today, ${moment(date).format('DD MMM YYYY')}`;
    case -1:
      return short ? 'Tomorrow' : `Tomorrow, ${moment(date).format('DD MMM YYYY')}`;
    case 1:
      return short ? 'Yesterday' : `Yesterday, ${moment(date).format('DD MMM YYYY')}`;
    default:
      return moment(date).format('ddd, DD MMM YYYY');
  }
};

/**
 * Returns the time portion of a date in the local time in the format H:MM AM/PM
 *
 * == Examples
 * * `T15:36:45.000Z` => 3:36 PM (if in +0:00 offset)
 */
export const formatTime: DateFormatFn = (date) => {
  return moment.utc(date).local().format('h:mm A');
};

export const formatDateAndTime: DateFormatFn = (date, short) => {
  return `${formatDate(date, short)} at ${formatTime(date)}`;
};
