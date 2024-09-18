import _ from 'lodash'
import * as dottie from 'dottie'
import { createAssetLinkFileTestFn } from './utils/asset'
import { makeRangeCheck } from './utils/range'
import { checkBoundaries } from './utils/integer'
import { Validation } from '../validation'

export function assetFileSize(params: { min: number; max: number }): Validation {
  checkBoundaries(params)
  params = _.pick(params, ['min', 'max'])
  const min = params.min
  const max = params.max
  const rangeCheck = makeRangeCheck(min, max)

  function checkSize(file: Record<string, any>): boolean {
    const size = dottie.get(file, 'details.size') as number
    return rangeCheck(size)
  }

  return Validation.fromTestFunction('assetFileSize', createAssetLinkFileTestFn(checkSize), {
    params,
  })
}
