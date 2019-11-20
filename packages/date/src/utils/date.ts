// eslint-disable-next-line no-restricted-imports
import moment from 'moment';
import { TimeResult } from '../types';

const ZONE_RX = /(Z|[+-]\d{2}[:+]?\d{2})$/;

function startOfToday(format: string) {
  return moment()
    .set({ hours: 0, minutes: 0 })
    .format(format);
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

function timeFromUserInput(input: TimeResult, uses12hClock: boolean) {
  const timeInput = input.time || '00:00';
  if (uses12hClock) {
    return moment.utc(timeInput + '!' + input.ampm, 'HH:mm!A');
  } else {
    return moment.utc(timeInput, 'HH:mm');
  }
}

/**
 * Convert the user input object into either a 'moment' value or an
 * invalid symbol.
 *
 * Success is indicated by returning '{valid: value}' and failure is
 * indicated by returning '{invalid: true}'. If 'input.date' is
 * 'null' we return '{valid: null}'
 */
function datetimeFromUserInput(
  input: TimeResult,
  uses12hClock: boolean
): { invalid?: boolean; valid: moment.Moment | null } {
  if (!input.date) {
    return { valid: null };
  }

  const time = timeFromUserInput(input, uses12hClock);

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

export function formatDateDisplay(date?: moment.Moment) {
  if (date) {
    return date.format('dddd, MMMM Do YYYY');
  } else {
    return '';
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
  uses12hClock,
  usesTime,
  usesTimezone
}: {
  data: TimeResult;
  uses12hClock: boolean;
  usesTime: boolean;
  usesTimezone: boolean;
}) {
  const date = datetimeFromUserInput(data, uses12hClock);
  if (date.invalid || date.valid === null) {
    return null;
  }

  let format;
  if (usesTimezone) {
    format = 'YYYY-MM-DDTHH:mmZ';
  } else if (usesTime) {
    format = 'YYYY-MM-DDTHH:mm';
  } else {
    format = 'YYYY-MM-DD';
  }
  return date?.valid ? date.valid.format(format) : null;
}

/**
 * Create the user input object from the field value.
 */
export function userInputFromDatetime({
  value,
  uses12hClock
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
      utcOffset: datetime.format('Z')
    };
  } else {
    return {
      ampm: startOfToday('A'),
      utcOffset: startOfToday('Z')
    };
  }
}
