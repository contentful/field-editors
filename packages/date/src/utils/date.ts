// eslint-disable-next-line -- TODO: move to date-fns
import moment from 'moment';
import { TimeResult } from '../types';

const ZONE_RX = /(Z|[+-]\d{2}[:+]?\d{2})$/;

function startOfToday(format: string) {
  return moment().set({ hours: 0, minutes: 0 }).format(format);
}

function fieldValueToMoment(datetimeString: string | null | undefined): moment.Moment | null {
  if (!datetimeString) {
    return null;
  }

  const datetime = moment(datetimeString);
  if (ZONE_RX.test(datetimeString)) {
    datetime.utcOffset(datetimeString);
  }
  return datetime;
}

function timeFromUserInput(input: TimeResult) {
  const timeInput = input.time || '00:00';
  return moment.utc(timeInput + '!' + input.ampm, 'HH:mm!A');
}

/**
 * Convert the user input object into either a 'moment' value or an
 * invalid symbol.
 *
 * Success is indicated by returning '{valid: value}' and failure is
 * indicated by returning '{invalid: true}'. If 'input.date' is
 * 'null' we return '{valid: null}'
 */
function datetimeFromUserInput(input: TimeResult): {
  invalid?: boolean;
  valid: moment.Moment | null;
} {
  if (!input.date) {
    return { valid: null };
  }

  const time = timeFromUserInput(input);

  const date = moment
    .parseZone(input.utcOffset, 'Z')
    .set(input.date.toObject())
    .set({ hours: time.hours(), minutes: time.minutes() });

  if (date.isValid()) {
    return { valid: date };
  } else {
    return { invalid: true, valid: null };
  }
}

/**
 * Parse user input into a string that is stored in the API.
 *
 * Returns a sum type with either the string as the `valid` property
 * or the `invalid` property set to `false`.
 */
export function buildFieldValue({
  data,
  usesTime,
  usesTimezone,
}: {
  data: TimeResult;
  usesTime: boolean;
  usesTimezone: boolean;
}) {
  const date = datetimeFromUserInput(data);
  if (date.invalid) {
    return {
      invalid: true,
    };
  }

  let format;
  if (usesTimezone) {
    format = 'YYYY-MM-DDTHH:mmZ';
  } else if (usesTime) {
    format = 'YYYY-MM-DDTHH:mm';
  } else {
    format = 'YYYY-MM-DD';
  }
  return { valid: date?.valid ? date.valid.format(format) : null, invalid: false };
}

export function getDefaultAMPM() {
  return 'AM';
}

export function getDefaultUtcOffset() {
  return startOfToday('Z');
}

/**
 * Create the user input object from the field value.
 */
export function userInputFromDatetime({
  value,
  uses12hClock,
}: {
  value: string | undefined | null;
  uses12hClock: boolean;
}): TimeResult {
  const datetime = fieldValueToMoment(value);

  if (datetime) {
    const timeFormat = uses12hClock ? 'hh:mm' : 'HH:mm';
    return {
      date: datetime,
      time: datetime.format(timeFormat),
      ampm: datetime.format('A'),
      utcOffset: datetime.format('Z'),
    };
  } else {
    return {
      ampm: getDefaultAMPM(),
      utcOffset: getDefaultUtcOffset(),
    };
  }
}
