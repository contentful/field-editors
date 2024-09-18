/* eslint-disable */

import _ from 'lodash';
import { Validation } from '../validation';
import { $ } from './utils/spock';

export function inValidation(values: Record<string, any>[]): Validation {
  if (!_.isArray(values)) {
    throw new Error('Expected array of choices as argument');
  }

  if (_.size(values) < 1) {
    throw new Error('Expected at least one choice');
  }

  const constraint = $({ in: [$.path(), values] });
  return Validation.fromConstraint('in', constraint, {
    expected: values,
  });
}
