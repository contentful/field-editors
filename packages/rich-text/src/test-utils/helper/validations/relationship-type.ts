import _ from 'lodash'
import { Validation } from '../validation'

export function relationshipType(relation: string[]): Validation {
  if (!_.isArray(relation)) {
    throw new TypeError('Expected Array as relationshipType validation argument')
  }

  if (relation.length !== 1 || relation[0] !== 'Composition') {
    throw new Error(`Only 'Composition' is allowed as relationshipType`)
  }

  return Validation.fromTestFunction(
    'relationshipType',
    // no additional validation based on context
    () => true,
    {}
  )
}
