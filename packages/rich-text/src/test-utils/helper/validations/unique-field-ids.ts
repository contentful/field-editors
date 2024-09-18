import { createUniqueFieldAttributeValidation } from './utils/unique-field-attribute'
import { Validation } from '../validation'

export function uniqueFieldIds(): Validation {
  return createUniqueFieldAttributeValidation('id')
}
