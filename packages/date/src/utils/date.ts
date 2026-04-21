import { format, getHours, getMinutes, isValid, parse, set } from 'date-fns';

import { TimeResult } from '../types';

const ZONE_RX = /(Z|[+-]\d{2}[:+]?\d{2})$/;

function startOfTodayOffset(): string {
  return format(new Date(), 'xxx');
}

function parseUtcOffset(datetimeString: string): string {
  const match = datetimeString.match(ZONE_RX);
  if (!match) return '+00:00';
  return match[1] === 'Z' ? '+00:00' : match[1];
}

function fieldValueToDate(datetimeString: string | null | undefined): Date | null {
  if (!datetimeString) return null;
  const date = parse(datetimeString.slice(0, 10), 'yyyy-MM-dd', new Date(0));
  return isValid(date) ? date : null;
}

// Mirrors the original moment logic: parse time as 24h, then apply AM/PM.
// e.g. time='05:00', ampm='PM' → hours=17, minutes=0
function timeFromUserInput(input: TimeResult): { hours: number; minutes: number } {
  const timeInput = input.time || '00:00';
  const parsed = parse(timeInput, 'HH:mm', new Date(0));
  let hours = getHours(parsed);
  const minutes = getMinutes(parsed);

  if (input.ampm === 'PM' && hours < 12) {
    hours += 12;
  } else if (input.ampm === 'AM' && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
}

/**
 * Convert the user input object into either a Date value or an
 * invalid symbol.
 *
 * Success is indicated by returning '{valid: value}' and failure is
 * indicated by returning '{invalid: true}'. If 'input.date' is
 * 'null' we return '{valid: null}'
 */
function datetimeFromUserInput(input: TimeResult): {
  invalid?: boolean;
  valid: Date | null;
} {
  if (!input.date) {
    return { valid: null };
  }

  const { hours, minutes } = timeFromUserInput(input);
  const date = set(input.date, { hours, minutes, seconds: 0, milliseconds: 0 });

  if (isValid(date)) {
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
    return { invalid: true };
  }

  if (!date.valid) {
    return { valid: null, invalid: false };
  }

  if (usesTimezone) {
    return { valid: format(date.valid, "yyyy-MM-dd'T'HH:mm") + data.utcOffset, invalid: false };
  } else if (usesTime) {
    return { valid: format(date.valid, "yyyy-MM-dd'T'HH:mm"), invalid: false };
  } else {
    return { valid: format(date.valid, 'yyyy-MM-dd'), invalid: false };
  }
}

export function getDefaultAMPM() {
  return 'AM';
}

export function getDefaultUtcOffset() {
  return startOfTodayOffset();
}

// Extract the time portion from an ISO string as HH:mm, ignoring timezone conversion.
// e.g. '2018-02-02T17:00+03:00' → '17:00'
function extractTimeFromIso(value: string): string | undefined {
  const match = value.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : undefined;
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
  const datetime = fieldValueToDate(value);

  if (datetime && value) {
    const rawTime = extractTimeFromIso(value);
    // Parse the raw HH:mm time to get hours/minutes for 12h formatting
    const timeDate = rawTime ? parse(rawTime, 'HH:mm', new Date(0)) : datetime;
    const hours = getHours(timeDate);
    const ampm = hours < 12 ? 'AM' : 'PM';

    let time: string;
    if (uses12hClock) {
      const h12 = hours % 12 || 12;
      time = `${String(h12).padStart(2, '0')}:${String(getMinutes(timeDate)).padStart(2, '0')}`;
    } else {
      time = rawTime ?? format(datetime, 'HH:mm');
    }

    return {
      date: datetime,
      time,
      ampm,
      utcOffset: parseUtcOffset(value),
    };
  } else {
    return {
      ampm: getDefaultAMPM(),
      utcOffset: getDefaultUtcOffset(),
    };
  }
}
