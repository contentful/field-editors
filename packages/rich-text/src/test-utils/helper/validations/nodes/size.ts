import { Block, Inline } from '@contentful/rich-text-types';
import _ from 'lodash';
import { Validation } from '../../validation';
import { checkPositiveIntegerBoundaries, getSafeIntegerBoundaries } from '../utils/integer';
import { getNodesByType } from '../utils/nodes';

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
export function size(params: Partial<{ min: number; max: number }>, nodeType: string): Validation {
  checkPositiveIntegerBoundaries(params);
  params = pickExisting(params, 'min', 'max');
  const { min, max } = getSafeIntegerBoundaries(params);
  const test = (rootNode: Block | Inline): boolean =>
    _.inRange(getNodesByType(rootNode.content, nodeType).length, min, max + 1);

  return Validation.fromTestFunction('size', test, {
    min: params.min,
    max: params.max,
    params,
    nodeType,
    type: 'nodeValidation',
  });
}
