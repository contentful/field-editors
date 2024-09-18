import _ from 'lodash';
import * as dottie from 'dottie';
import { Validation } from '../validation';
import { checkPositiveIntegerBoundaries } from './utils/integer';
import { makeRangeCheck } from './utils/range';
import { createAssetLinkFileTestFn } from './utils/asset';

export function exists<T>(value?: T): value is NonNullable<T> {
  return typeof value !== 'undefined' && value !== null;
}

export function assetImageDimensions(bounds: {
  width: { min: number; max: number };
  height: { min: number; max: number };
}): Validation {
  bounds = _.pick(bounds, ['width', 'height']);

  const width = bounds.width || {};
  const height = bounds.height || {};
  checkPositiveIntegerBoundaries(width, false);
  checkPositiveIntegerBoundaries(height, false);

  if (!exists(width.min) && !exists(width.max) && !exists(height.min) && !exists(height.max)) {
    throw new TypeError('Expected at least one dimension bound');
  }

  const checkWidth = makeRangeCheck(width.min, width.max);
  const checkHeight = makeRangeCheck(height.min, height.max);

  function checkDimensions(file: Record<string, any>): boolean {
    const dimensions = dottie.get(file, 'details.image') as {
      width: number;
      height: number;
    };

    if (_.isObject(dimensions)) {
      return checkWidth(dimensions.width) && checkHeight(dimensions.height);
    } else {
      return true;
    }
  }

  return Validation.fromTestFunction(
    'assetImageDimensions',
    createAssetLinkFileTestFn(checkDimensions),
    {
      params: bounds,
    }
  );
}
