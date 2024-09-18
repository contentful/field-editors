import { Document } from '@contentful/rich-text-types';
import * as richTextPlainTextRenderer from '@contentful/rich-text-plain-text-renderer';
import _ from 'lodash';
import { Validation } from '../validation';
import { checkPositiveIntegerBoundaries, getSafeIntegerBoundaries } from './utils/integer';
import { $ } from './utils/spock';

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

export function size(params: { min?: number; max?: number }, fieldType?: string): Validation {
  checkPositiveIntegerBoundaries(params);
  params = pickExisting(params, 'min', 'max');
  const options = {
    min: params.min,
    max: params.max,
    params,
  };

  if (fieldType === 'RichText') {
    const { min, max } = getSafeIntegerBoundaries(params);
    const test = (richTextDocument: Document): boolean => {
      const fieldLength =
        richTextPlainTextRenderer.documentToPlainTextString(richTextDocument).length;
      return _.inRange(fieldLength, min, max + 1);
    };
    return Validation.fromTestFunction('size', test, options);
  } else {
    const constraint = $({ size: [$.path(), params] });
    return Validation.fromConstraint('size', constraint, options);
  }
}
