// eslint-disable-next-line no-restricted-imports
import moment from 'moment';

export type DateTimeFormat = 'dateonly' | 'time' | 'timeZ';

export type TimeFormat = '12' | '24';

export type TimeResult = {
  date?: moment.Moment;
  time?: string;
  ampm: string;
  utcOffset: string;
};
