import Pikaday from 'pikaday';

const I18N = {
  previousMonth: 'Previous Month',
  nextMonth: 'Next Month',
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ],
  weekdaysShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
};

const DEFAULTS = {
  i18n: I18N,
  yearRange: 100
};

// Gets same options as Pikaday and returns a Pikaday instance
export const createPikaday = (opts?: Pikaday.PikadayOptions) =>
  new Pikaday(Object.assign({}, DEFAULTS, opts));
