// eslint-disable-next-line no-restricted-imports
import moment from 'moment';

import { buildFieldValue } from './date';

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
        })
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
        })
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
        })
      ).toEqual({
        invalid: false,
        valid: '2015-01-14T17:00-05:00',
      });
    });
  });
});
