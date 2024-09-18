import { isNumber, isFinite, isObject } from 'lodash';
export function exists<T>(value?: T): value is NonNullable<T> {
  return typeof value !== 'undefined' && value !== null;
}

export function getSafeIntegerBoundaries({ min, max }: Partial<{ min: number; max: number }>): {
  min: number;
  max: number;
} {
  return {
    min: isPositiveInteger(min) ? min : 0,
    max: isPositiveInteger(max) ? max : Number.MAX_SAFE_INTEGER - 1,
  };
}
export function checkPositiveIntegerBoundaries(
  bounds: { min?: number; max?: number },
  require?: boolean
): void {
  checkBoundaries(bounds, require);

  if (exists(bounds.min) && !isPositiveInteger(bounds.min)) {
    throw new TypeError('Expected min to be a non-negative integer');
  }

  if (exists(bounds.max) && !isPositiveInteger(bounds.max)) {
    throw new TypeError('Expected max to be a non-negative integer');
  }
}

export function checkBoundaries(bounds: { min?: number; max?: number }, require?: boolean): void {
  require = require !== false;

  if (require && !isObject(bounds)) {
    throw new Error('Expected object as argument');
  }

  if (require && !exists(bounds.max) && !exists(bounds.min)) {
    throw new Error('Expected min and/or max boundaries');
  }

  if (!existingNumberIsFinite(bounds.max)) {
    throw new Error('Expected max to be a number');
  }

  if (!existingNumberIsFinite(bounds.min)) {
    throw new Error('Expected min to be a number');
  }

  if (isNumber(bounds.min) && isNumber(bounds.max) && bounds.max < bounds.min) {
    throw new Error('Expected max >= min');
  }
}

export function isPositiveInteger(value?: number): value is number {
  return isNumber(value) && value >= 0 && value % 1 === 0;
}

export function existingNumberIsFinite(value?: number): boolean {
  return !exists(value) || (isNumber(value) && isFinite(value));
}
