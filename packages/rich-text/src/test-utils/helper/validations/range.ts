import { Validation } from '../validation';
import { checkBoundaries } from './utils/integer';
import { $ } from './utils/spock';
import _ from 'lodash';

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

export function range(params: Partial<{ min: number; max: number }>): Validation {
  checkBoundaries(params);
  params = pickExisting(params, 'min', 'max');
  const min = params.min;
  const max = params.max;

  const constraint = $({ range: [$.path(), params] });
  return Validation.fromConstraint('range', constraint, {
    min,
    max,
    params,
  });
}
