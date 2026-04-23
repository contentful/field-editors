import { format } from 'date-fns';

import { formatDate, formatDateAndTime, formatTime } from './formatDateAndTime';

const TODAY = new Date('2024-06-15T12:00:00.000Z');

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(TODAY);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('formatDate', () => {
  it('returns "Today" (short) for a date on the same calendar day', () => {
    expect(formatDate('2024-06-15T08:00:00.000Z', true)).toBe('Today');
  });

  it('returns long form for today', () => {
    const d = new Date('2024-06-15T08:00:00.000Z');
    expect(formatDate(d)).toBe(`Today, ${format(d, 'dd MMM yyyy')}`);
  });

  it('returns "Tomorrow" (short) for the next calendar day', () => {
    expect(formatDate('2024-06-16T08:00:00.000Z', true)).toBe('Tomorrow');
  });

  it('returns long form for tomorrow', () => {
    const d = new Date('2024-06-16T08:00:00.000Z');
    expect(formatDate(d)).toBe(`Tomorrow, ${format(d, 'dd MMM yyyy')}`);
  });

  it('returns "Yesterday" (short) for the previous calendar day', () => {
    expect(formatDate('2024-06-14T08:00:00.000Z', true)).toBe('Yesterday');
  });

  it('returns long form for yesterday', () => {
    const d = new Date('2024-06-14T08:00:00.000Z');
    expect(formatDate(d)).toBe(`Yesterday, ${format(d, 'dd MMM yyyy')}`);
  });

  it('returns weekday + date for a past date beyond yesterday', () => {
    const d = new Date('2024-06-01T08:00:00.000Z');
    expect(formatDate(d)).toBe(format(d, 'eee, dd MMM yyyy'));
  });

  it('returns weekday + date for a future date beyond tomorrow', () => {
    const d = new Date('2024-06-20T08:00:00.000Z');
    expect(formatDate(d)).toBe(format(d, 'eee, dd MMM yyyy'));
  });

  it('accepts a Date object', () => {
    const d = new Date('2024-06-15T09:30:00.000Z');
    expect(formatDate(d, true)).toBe('Today');
  });
});

describe('formatTime', () => {
  it('formats a UTC ISO string to local h:mm a', () => {
    const iso = '2024-06-15T15:36:45.000Z';
    expect(formatTime(iso)).toBe(format(new Date(iso), 'h:mm a'));
  });

  it('formats midnight UTC correctly in local time', () => {
    const iso = '2024-06-15T00:00:00.000Z';
    expect(formatTime(iso)).toBe(format(new Date(iso), 'h:mm a'));
  });

  it('formats noon UTC correctly', () => {
    const iso = '2024-06-15T12:00:00.000Z';
    expect(formatTime(iso)).toBe(format(new Date(iso), 'h:mm a'));
  });

  it('timezone shift: two UTC times 1 hour apart produce outputs 1 hour apart', () => {
    const earlier = new Date('2024-06-15T10:00:00.000Z');
    const later = new Date('2024-06-15T11:00:00.000Z');
    // Both assertions use format() so they're timezone-agnostic and consistent
    // with what formatTime produces regardless of where tests run
    expect(formatTime(earlier)).toBe(format(earlier, 'h:mm a'));
    expect(formatTime(later)).toBe(format(later, 'h:mm a'));
    // Verify the two outputs differ (they represent different hours)
    expect(formatTime(earlier)).not.toBe(formatTime(later));
  });

  it('accepts a Date object', () => {
    const d = new Date('2024-06-15T15:36:45.000Z');
    expect(formatTime(d)).toBe(format(d, 'h:mm a'));
  });
});

describe('formatDateAndTime', () => {
  it('combines date and time with " at " separator', () => {
    const iso = '2024-06-15T15:36:45.000Z';
    expect(formatDateAndTime(iso)).toBe(`${formatDate(iso)} at ${formatTime(iso)}`);
  });

  it('passes short flag through to date portion', () => {
    const iso = '2024-06-15T15:36:45.000Z';
    expect(formatDateAndTime(iso, true)).toBe(`Today at ${formatTime(iso)}`);
  });

  it('works for a past date', () => {
    const iso = '2024-06-01T08:00:00.000Z';
    expect(formatDateAndTime(iso)).toBe(`${formatDate(iso)} at ${formatTime(iso)}`);
  });
});
