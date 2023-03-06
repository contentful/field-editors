// eslint-disable-next-line -- We're moving to native js or dateFns but this module relies on moment
import moment from 'moment';

export type DateTimeFormat = 'dateonly' | 'time' | 'timeZ';

export type TimeFormat = '12' | '24';

export type TimeResult = {
  date?: moment.Moment;
  time?: string;
  ampm: string;
  utcOffset: string;
};
