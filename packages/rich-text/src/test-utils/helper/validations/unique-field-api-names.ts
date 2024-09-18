import { createUniqueFieldAttributeValidation } from './utils/unique-field-attribute'
import { Validation } from '../validation'

export function uniqueFieldApiNames(): Validation {
  return createUniqueFieldAttributeValidation('apiName', {
    skipDeleted: true,
  })
}
