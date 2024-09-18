import _ from 'lodash';
import { checkRegexp } from './utils/regexp';
import { Validation } from '../validation';
import { $ } from './utils/spock';

export function exists<T>(value?: T): value is NonNullable<T> {
  return typeof value !== 'undefined' && value !== null;
}

export function regexp(params: Partial<{ pattern: string; flags: string }>): Validation {
  checkRegexp(params);
  params = _(params).pickBy(exists).pick(['pattern', 'flags']).value();

  const constraint = $({ regexp: [$.path(), params] });
  return Validation.fromConstraint('regexp', constraint, {
    pattern: params.pattern,
    flags: params.flags,
    params,
  });
}
