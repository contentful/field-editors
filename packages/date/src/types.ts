export type DateTimeFormat = 'dateonly' | 'time' | 'timeZ';

export type TimeFormat = '12' | '24';

export type TimeResult = {
  date?: Date;
  time?: string;
  ampm: string;
  utcOffset: string;
};
