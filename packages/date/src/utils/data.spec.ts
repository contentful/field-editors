import {
  buildFieldValue,
  userInputFromDatetime,
  getDefaultAMPM,
  getDefaultUtcOffset,
} from './date';

describe('date utils', () => {
  describe('buildFieldValue', () => {
    it('should work properly', () => {
      expect(
        buildFieldValue({
          data: {
            date: new Date('2018-02-02'),
            time: '05:00',
            ampm: 'PM',
            utcOffset: '+03:00',
          },
          usesTimezone: true,
          usesTime: true,
        }),
      ).toEqual({
        invalid: false,
        valid: '2018-02-02T17:00+03:00',
      });

      expect(
        buildFieldValue({
          data: {
            date: new Date('2015-01-14'),
            time: '05:00',
            ampm: 'AM',
            utcOffset: '-05:00',
          },
          usesTimezone: true,
          usesTime: true,
        }),
      ).toEqual({
        invalid: false,
        valid: '2015-01-14T05:00-05:00',
      });

      expect(
        buildFieldValue({
          data: {
            date: new Date('2015-01-14'),
            time: '17:00',
            ampm: 'PM',
            utcOffset: '-05:00',
          },
          usesTimezone: true,
          usesTime: true,
        }),
      ).toEqual({
        invalid: false,
        valid: '2015-01-14T17:00-05:00',
      });
    });

    it('returns date-only format when usesTime and usesTimezone are false', () => {
      expect(
        buildFieldValue({
          data: {
            date: new Date('2020-06-15'),
            time: '10:30',
            ampm: 'AM',
            utcOffset: '+00:00',
          },
          usesTimezone: false,
          usesTime: false,
        }),
      ).toEqual({
        invalid: false,
        valid: '2020-06-15',
      });
    });

    it('returns datetime without timezone when usesTime=true, usesTimezone=false', () => {
      expect(
        buildFieldValue({
          data: {
            date: new Date('2020-06-15'),
            time: '14:30',
            ampm: 'PM',
            utcOffset: '+00:00',
          },
          usesTimezone: false,
          usesTime: true,
        }),
      ).toEqual({
        invalid: false,
        valid: '2020-06-15T14:30',
      });
    });

    it('returns valid: null when no date is provided', () => {
      expect(
        buildFieldValue({
          data: {
            time: '10:00',
            ampm: 'AM',
            utcOffset: '+00:00',
          },
          usesTimezone: true,
          usesTime: true,
        }),
      ).toEqual({
        invalid: false,
        valid: null,
      });
    });

    it('handles midnight (12:00 AM) correctly', () => {
      expect(
        buildFieldValue({
          data: {
            date: new Date('2021-03-01'),
            time: '12:00',
            ampm: 'AM',
            utcOffset: '+00:00',
          },
          usesTimezone: true,
          usesTime: true,
        }),
      ).toEqual({
        invalid: false,
        valid: '2021-03-01T00:00+00:00',
      });
    });

    it('handles noon (12:00 PM) correctly', () => {
      expect(
        buildFieldValue({
          data: {
            date: new Date('2021-03-01'),
            time: '12:00',
            ampm: 'PM',
            utcOffset: '+00:00',
          },
          usesTimezone: true,
          usesTime: true,
        }),
      ).toEqual({
        invalid: false,
        valid: '2021-03-01T12:00+00:00',
      });
    });

    // Timezone offset passthrough — parity with moment.format('YYYY-MM-DDTHH:mmZ').
    // The offset is appended verbatim from data.utcOffset, not derived from the Date.

    it('preserves half-hour offset +05:30 (India)', () => {
      expect(
        buildFieldValue({
          data: {
            date: new Date('2023-08-15'),
            time: '10:00',
            ampm: 'AM',
            utcOffset: '+05:30',
          },
          usesTimezone: true,
          usesTime: true,
        }),
      ).toEqual({
        invalid: false,
        valid: '2023-08-15T10:00+05:30',
      });
    });

    it('preserves negative half-hour offset -09:30', () => {
      expect(
        buildFieldValue({
          data: {
            date: new Date('2023-08-15'),
            time: '03:30',
            ampm: 'AM',
            utcOffset: '-09:30',
          },
          usesTimezone: true,
          usesTime: true,
        }),
      ).toEqual({
        invalid: false,
        valid: '2023-08-15T03:30-09:30',
      });
    });

    it('preserves quarter-hour offset +05:45 (Nepal)', () => {
      expect(
        buildFieldValue({
          data: {
            date: new Date('2023-08-15'),
            time: '05:45',
            ampm: 'AM',
            utcOffset: '+05:45',
          },
          usesTimezone: true,
          usesTime: true,
        }),
      ).toEqual({
        invalid: false,
        valid: '2023-08-15T05:45+05:45',
      });
    });

    it('preserves UTC +00:00 offset', () => {
      expect(
        buildFieldValue({
          data: {
            date: new Date('2023-01-01'),
            time: '00:00',
            ampm: 'AM',
            utcOffset: '+00:00',
          },
          usesTimezone: true,
          usesTime: true,
        }),
      ).toEqual({
        invalid: false,
        valid: '2023-01-01T00:00+00:00',
      });
    });

    it('preserves far-west offset -12:00', () => {
      expect(
        buildFieldValue({
          data: {
            date: new Date('2023-01-01'),
            time: '23:59',
            ampm: 'PM',
            utcOffset: '-12:00',
          },
          usesTimezone: true,
          usesTime: true,
        }),
      ).toEqual({
        invalid: false,
        valid: '2023-01-01T23:59-12:00',
      });
    });

    it('preserves far-east offset +14:00', () => {
      expect(
        buildFieldValue({
          data: {
            date: new Date('2023-01-01'),
            time: '01:00',
            ampm: 'AM',
            utcOffset: '+14:00',
          },
          usesTimezone: true,
          usesTime: true,
        }),
      ).toEqual({
        invalid: false,
        valid: '2023-01-01T01:00+14:00',
      });
    });

    // 12h → 24h conversion parity with moment.utc(time+'!'+ampm, 'HH:mm!A')

    it('11:59 PM → 23:59', () => {
      expect(
        buildFieldValue({
          data: {
            date: new Date('2023-06-01'),
            time: '11:59',
            ampm: 'PM',
            utcOffset: '+00:00',
          },
          usesTimezone: true,
          usesTime: true,
        }),
      ).toEqual({
        invalid: false,
        valid: '2023-06-01T23:59+00:00',
      });
    });

    it('01:00 AM → 01:00 (no shift)', () => {
      expect(
        buildFieldValue({
          data: {
            date: new Date('2023-06-01'),
            time: '01:00',
            ampm: 'AM',
            utcOffset: '+00:00',
          },
          usesTimezone: true,
          usesTime: true,
        }),
      ).toEqual({
        invalid: false,
        valid: '2023-06-01T01:00+00:00',
      });
    });
  });

  describe('userInputFromDatetime', () => {
    it('parses a full ISO datetime string with timezone', () => {
      const result = userInputFromDatetime({
        value: '2018-02-02T17:00+03:00',
        uses12hClock: false,
      });
      expect(result.time).toBe('17:00');
      expect(result.ampm).toBe('PM');
      expect(result.utcOffset).toBe('+03:00');
    });

    it('parses a full ISO datetime string with 12h clock', () => {
      const result = userInputFromDatetime({
        value: '2018-02-02T05:00+03:00',
        uses12hClock: true,
      });
      expect(result.time).toBe('05:00');
      expect(result.ampm).toBe('AM');
      expect(result.utcOffset).toBe('+03:00');
    });

    it('returns defaults when value is null', () => {
      const result = userInputFromDatetime({ value: null, uses12hClock: false });
      expect(result.date).toBeUndefined();
      expect(result.ampm).toBe(getDefaultAMPM());
      expect(result.utcOffset).toBe(getDefaultUtcOffset());
    });

    it('returns defaults when value is undefined', () => {
      const result = userInputFromDatetime({ value: undefined, uses12hClock: false });
      expect(result.date).toBeUndefined();
      expect(result.ampm).toBe(getDefaultAMPM());
    });

    it('returns defaults when value is empty string', () => {
      const result = userInputFromDatetime({ value: '', uses12hClock: false });
      expect(result.date).toBeUndefined();
    });

    it('parses a date-only string', () => {
      const result = userInputFromDatetime({ value: '2022-09-16', uses12hClock: false });
      expect(result.utcOffset).toBe('+00:00');
    });

    // Timezone offset handling — the raw HH:mm is extracted directly from the string
    // so the displayed time is never shifted by the local system timezone.

    it('preserves raw time and does not shift by system timezone (positive offset)', () => {
      const result = userInputFromDatetime({
        value: '2020-03-15T14:00+05:30',
        uses12hClock: false,
      });
      expect(result.time).toBe('14:00');
      expect(result.ampm).toBe('PM');
      expect(result.utcOffset).toBe('+05:30');
    });

    it('preserves raw time and does not shift by system timezone (negative offset)', () => {
      const result = userInputFromDatetime({
        value: '2020-03-15T08:30-05:30',
        uses12hClock: false,
      });
      expect(result.time).toBe('08:30');
      expect(result.ampm).toBe('AM');
      expect(result.utcOffset).toBe('-05:30');
    });

    it('handles UTC "Z" suffix — normalizes offset to +00:00', () => {
      const result = userInputFromDatetime({
        value: '2021-06-01T12:00Z',
        uses12hClock: false,
      });
      expect(result.time).toBe('12:00');
      expect(result.ampm).toBe('PM');
      expect(result.utcOffset).toBe('+00:00');
    });

    it('handles midnight UTC correctly', () => {
      const result = userInputFromDatetime({
        value: '2021-06-01T00:00Z',
        uses12hClock: false,
      });
      expect(result.time).toBe('00:00');
      expect(result.ampm).toBe('AM');
    });

    // 12h clock conversion — parity with moment.format('hh:mm') + format('A')
    it('converts PM hour to 12h display (17:00 → 05:00 PM)', () => {
      const result = userInputFromDatetime({
        value: '2018-02-02T17:00+03:00',
        uses12hClock: true,
      });
      expect(result.time).toBe('05:00');
      expect(result.ampm).toBe('PM');
    });

    it('converts noon to 12h display (12:00 → 12:00 PM)', () => {
      const result = userInputFromDatetime({
        value: '2021-03-01T12:00+00:00',
        uses12hClock: true,
      });
      expect(result.time).toBe('12:00');
      expect(result.ampm).toBe('PM');
    });

    it('converts midnight to 12h display (00:00 → 12:00 AM)', () => {
      const result = userInputFromDatetime({
        value: '2021-03-01T00:00+00:00',
        uses12hClock: true,
      });
      expect(result.time).toBe('12:00');
      expect(result.ampm).toBe('AM');
    });

    it('handles quarter-hour offset +05:45 (Nepal)', () => {
      const result = userInputFromDatetime({
        value: '2023-07-20T09:45+05:45',
        uses12hClock: false,
      });
      expect(result.time).toBe('09:45');
      expect(result.utcOffset).toBe('+05:45');
    });

    it('handles -12:00 (far-west) offset without date shift', () => {
      const result = userInputFromDatetime({
        value: '2023-01-01T23:59-12:00',
        uses12hClock: false,
      });
      expect(result.time).toBe('23:59');
      expect(result.utcOffset).toBe('-12:00');
    });

    it('handles +14:00 (far-east) offset without date shift', () => {
      const result = userInputFromDatetime({
        value: '2023-01-01T01:00+14:00',
        uses12hClock: false,
      });
      expect(result.time).toBe('01:00');
      expect(result.utcOffset).toBe('+14:00');
    });
  });

  describe('getDefaultAMPM', () => {
    it('returns AM', () => {
      expect(getDefaultAMPM()).toBe('AM');
    });
  });
});
