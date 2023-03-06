// eslint-disable-next-line -- need to move to native js or dateFns
import moment from 'moment';

export type DateTimeFormat = 'dateonly' | 'time' | 'timeZ';

export type TimeFormat = '12' | '24';

export type TimeResult = {
  date?: moment.Moment;
  time?: string;
  ampm: string;
  utcOffset: string;
};
