// eslint-disable-next-line -- TODO: move to date-fns
import moment from 'moment';
import { TimeResult } from '../types';
import { defaultZoneOffset } from './zoneOffsets';

const ZONE_RX = /(Z|[+-]\d{2}[:+]?\d{2})$/;

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
  let utcOffset = input.utcOffset;

  // If we have the default local offset, compute the local offset for the specified date
  if (utcOffset === defaultZoneOffset) {
    utcOffset = computeLocalZoneOffset(input.date, time);
  }

  const date = moment
    .parseZone(utcOffset, 'Z')
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
  return defaultZoneOffset;
}

/**
 * Compute the local zone offset for the specified date and time.
 *
 * @param date - The moment object for the date
 * @param time - Optional moment with time
 * @returns The offset as a string (e.g., "-08:00", "+05:30")
 */
export function computeLocalZoneOffset(date: moment.Moment, time?: moment.Moment): string {
  let targetMoment = date.clone();
  if (time) {
    targetMoment = targetMoment.set({
      hour: time.hour(),
      minute: time.minute(),
      second: 0,
      millisecond: 0,
    });
  } else {
    // Default to midnight
    targetMoment = targetMoment.startOf('day');
  }

  // Format as string (e.g., "-08:00", "+05:30")
  return targetMoment.format('Z');
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
    let utcOffset = datetime.format('Z');
    const localOffset = computeLocalZoneOffset(datetime);
    if (utcOffset === localOffset) {
      utcOffset = defaultZoneOffset;
    }
    const timeFormat = uses12hClock ? 'hh:mm' : 'HH:mm';
    return {
      date: datetime,
      time: datetime.format(timeFormat),
      ampm: datetime.format('A'),
      utcOffset: utcOffset,
    };
  } else {
    return {
      ampm: getDefaultAMPM(),
      utcOffset: getDefaultUtcOffset(),
    };
  }
}
