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
    expect(formatDate('2024-06-15T08:00:00.000Z')).toBe('Today, 15 Jun 2024');
  });

  it('returns "Tomorrow" (short) for the next calendar day', () => {
    expect(formatDate('2024-06-16T08:00:00.000Z', true)).toBe('Tomorrow');
  });

  it('returns long form for tomorrow', () => {
    expect(formatDate('2024-06-16T08:00:00.000Z')).toBe('Tomorrow, 16 Jun 2024');
  });

  it('returns "Yesterday" (short) for the previous calendar day', () => {
    expect(formatDate('2024-06-14T08:00:00.000Z', true)).toBe('Yesterday');
  });

  it('returns long form for yesterday', () => {
    expect(formatDate('2024-06-14T08:00:00.000Z')).toBe('Yesterday, 14 Jun 2024');
  });

  it('returns weekday + date for a past date beyond yesterday', () => {
    expect(formatDate('2024-06-01T08:00:00.000Z')).toBe('Sat, 01 Jun 2024');
  });

  it('returns weekday + date for a future date beyond tomorrow', () => {
    expect(formatDate('2024-06-20T08:00:00.000Z')).toBe('Thu, 20 Jun 2024');
  });

  it('accepts a Date object', () => {
    expect(formatDate(new Date('2024-06-15T09:30:00.000Z'), true)).toBe('Today');
  });
});

describe('formatTime', () => {
  it('formats a UTC ISO string to local h:mm AM/PM', () => {
    expect(formatTime('2024-06-15T15:36:45.000Z')).toBe('3:36 PM');
  });

  it('formats midnight UTC correctly', () => {
    expect(formatTime('2024-06-15T00:00:00.000Z')).toBe('12:00 AM');
  });

  it('formats noon UTC correctly', () => {
    expect(formatTime('2024-06-15T12:00:00.000Z')).toBe('12:00 PM');
  });

  it('timezone shift: two UTC times 1 hour apart produce different outputs', () => {
    expect(formatTime('2024-06-15T10:00:00.000Z')).toBe('10:00 AM');
    expect(formatTime('2024-06-15T11:00:00.000Z')).toBe('11:00 AM');
  });

  it('accepts a Date object', () => {
    expect(formatTime(new Date('2024-06-15T15:36:45.000Z'))).toBe('3:36 PM');
  });
});

describe('formatDateAndTime', () => {
  it('combines date and time with " at " separator', () => {
    expect(formatDateAndTime('2024-06-15T15:36:45.000Z')).toBe('Today, 15 Jun 2024 at 3:36 PM');
  });

  it('passes short flag through to date portion', () => {
    expect(formatDateAndTime('2024-06-15T15:36:45.000Z', true)).toBe('Today at 3:36 PM');
  });

  it('works for a past date', () => {
    expect(formatDateAndTime('2024-06-01T08:00:00.000Z')).toBe('Sat, 01 Jun 2024 at 8:00 AM');
  });
});
