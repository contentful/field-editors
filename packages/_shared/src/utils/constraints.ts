/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * This module parses field validations as a constraint and checks
 * values against that constraint.
 */

import isNumber from 'lodash/isNumber';

import { ValidationType } from '../types';

export function fromFieldValidations(
  validations: Record<string, any>[] = [],
  fieldType: 'Symbol' | 'Text'
): ValidationType {
  const sizeValidation = validations.find((v) => 'size' in v);
  const size = (sizeValidation && sizeValidation.size) || {};
  const min = size.min;
  const max = size.max;

  if (isNumber(min) && isNumber(max)) {
    return {
      type: 'min-max',
      min,
      max,
    };
  } else if (isNumber(min)) {
    return {
      type: 'min',
      min,
    };
  } else if (isNumber(max)) {
    return {
      type: 'max',
      max,
    };
  } else {
    return {
      type: 'max',
      max: fieldType === 'Symbol' ? 256 : 50000,
    };
  }
}

export function makeChecker(constraint: ValidationType) {
  return function checkConstraint(length: number) {
    if (constraint.type === 'max') {
      return length <= constraint.max;
    } else if (constraint.type === 'min') {
      return length >= constraint.min;
    } else {
      return length >= constraint.min && length <= constraint.max;
    }
  };
}
