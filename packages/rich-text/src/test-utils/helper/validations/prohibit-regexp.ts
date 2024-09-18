import _ from 'lodash';
import { Validation } from '../validation';
import { checkRegexp } from './utils/regexp';
import { $ } from './utils/spock';
export function exists<T>(value?: T): value is NonNullable<T> {
  return typeof value !== 'undefined' && value !== null;
}

export function prohibitRegexp(params: any): Validation {
  checkRegexp(params);
  params = _(params).pickBy(exists).pick(['pattern', 'flags']).value();

  const constraint = $({ prohibitRegexp: [$.path(), params] });
  return Validation.fromConstraint('prohibitRegexp', constraint, {
    pattern: params.pattern,
    flags: params.flags,
    params,
  });
}
