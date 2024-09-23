// eslint-disable-next-line -- TODO: move to date-fns
import moment from 'moment';

export type DateTimeFormat = 'dateonly' | 'time' | 'timeZ';

export type TimeFormat = '12' | '24';

export type TimeResult = {
  date?: moment.Moment;
  time?: string;
  ampm: string;
  utcOffset: string;
};
