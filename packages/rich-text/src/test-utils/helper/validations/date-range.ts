import moment from 'moment';
import _ from 'lodash';
import { Validation } from '../validation';
import { getMoment } from './utils/date';

export function exists<T>(value?: T): value is NonNullable<T> {
  return typeof value !== 'undefined' && value !== null;
}

export function pickExisting(...args: any[]): Record<string, any> {
  const collection = args.shift();

  if (args.length === 0) {
    return _.pickBy(collection, exists);
  } else {
    return _.pickBy(collection, function (value, key) {
      return exists(value) && args.indexOf(key) >= 0;
    });
  }
}

export function quote(s: string | number): string {
  return JSON.stringify(s);
}
export function dateRange(params: Partial<{ min: number; max: number }>): Validation {
  params = pickExisting(params, 'min', 'max');
  const moments: Partial<{ min: moment.Moment; max: moment.Moment }> = _.mapValues(
    params,
    getMoment
  );
  const min = moments.min;
  const max = moments.max;

  if (!min && !max) {
    throw new Error('Expected "min" or "max" date');
  }

  if (min && !min.isValid()) {
    throw new TypeError('Could not convert ' + quote(params.min as number) + ' into a Date');
  }

  if (max && !max.isValid()) {
    throw new TypeError('Could not convert ' + quote(params.max as number) + ' into a Date');
  }

  if (max && min && max.isBefore(min)) {
    throw new Error('Minimum date is later than maximum date');
  }

  const displayParams = _.mapValues(moments, function (time) {
    return time && time.toISOString();
  });

  /**
   * Return `true` if and only if `time` satisfies all provided
   * bounds.
   *
   * If `after` is defined we must have `after <= time`. If `before`
   * is defined we must have `time <= before`.
   */
  function satisfiesBounds(time: moment.Moment): boolean {
    let valid = true;

    if (min) {
      valid = valid && (time.isSame(min) || time.isAfter(min));
    }

    if (max) {
      valid = valid && (time.isSame(max) || time.isBefore(max));
    }

    return valid;
  }

  function validate(timestamp: Date | number | string): Record<string, any>[] {
    const time = getMoment(timestamp);

    if (!time.isValid()) {
      return [{ code: 'EINVALIDDATE' }];
    }

    if (satisfiesBounds(time)) {
      return [];
    } else {
      return [_.extend({ code: 'ERANGE' }, displayParams)];
    }
  }

  return new Validation('dateRange', validate);
}
