// eslint-disable-next-line -- TODO: move to date-fns
import moment from 'moment';
import { buildFieldValue, computeLocalZoneOffset, userInputFromDatetime } from './date';
import { defaultZoneOffset } from './zoneOffsets';

describe('date utils', () => {
  describe('buildFieldValue', () => {
    it('should work properly', () => {
      expect(
        buildFieldValue({
          data: {
            date: moment('2018-02-02'),
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
            date: moment('2015-01-14'),
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
            date: moment('2015-01-14'),
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

    it('uses the DST-aware local offset when utcOffset is "Local time"', () => {
      const date = moment('2025-07-04');
      const expectedOffset = computeLocalZoneOffset(date);
      const result = buildFieldValue({
        data: {
          date,
          time: '20:00',
          ampm: 'PM',
          utcOffset: defaultZoneOffset,
        },
        usesTimezone: true,
        usesTime: true,
      });
      expect(result).toEqual({
        invalid: false,
        valid: `2025-07-04T20:00${expectedOffset}`,
      });
    });
  });

  describe('computeLocalZoneOffset', () => {
    it('returns a valid UTC offset string', () => {
      const offset = computeLocalZoneOffset(moment('2025-07-04'));
      expect(offset).toMatch(/^[+-]\d{2}:\d{2}$/);
    });

    it('is not affected by a fixed UTC offset on the input moment', () => {
      // Same calendar date/time stored with two different explicit offsets
      const withPositiveOffset = moment.parseZone('2025-07-04T12:00+05:30');
      const withNegativeOffset = moment.parseZone('2025-07-04T12:00-08:00');
      // Both should produce the same local offset for 2025-07-04 at 12:00
      expect(computeLocalZoneOffset(withPositiveOffset)).toBe(
        computeLocalZoneOffset(withNegativeOffset),
      );
    });
  });

  describe('userInputFromDatetime', () => {
    it('detects a value stored in the local timezone and returns "Local time"', () => {
      const localOffset = computeLocalZoneOffset(moment('2025-07-04'));
      const result = userInputFromDatetime({
        value: `2025-07-04T12:00${localOffset}`,
        uses12hClock: false,
      });
      expect(result.utcOffset).toBe(defaultZoneOffset);
    });

    it('preserves an explicit offset that differs from the local timezone', () => {
      const localOffset = computeLocalZoneOffset(moment('2025-07-04'));
      const explicitOffset = localOffset === '+05:30' ? '+03:00' : '+05:30';
      const result = userInputFromDatetime({
        value: `2025-07-04T12:00${explicitOffset}`,
        uses12hClock: false,
      });
      expect(result.utcOffset).toBe(explicitOffset);
    });

    it('returns "Local time" as the default when no value is provided', () => {
      const result = userInputFromDatetime({ value: null, uses12hClock: false });
      expect(result.utcOffset).toBe(defaultZoneOffset);
    });
  });
});
