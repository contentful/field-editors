import mimetype from '@contentful/mimetype'
import { Validation } from '../validation'

export function isValidMimeType(): Validation {
  return Validation.fromTestFunction('isValidMimeType', mimetype.typeExists, {
    allowed: mimetype.getValidTypes(),
  })
}
