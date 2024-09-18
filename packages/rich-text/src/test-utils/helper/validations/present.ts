import { $ } from './utils/spock'
import { Validation } from '../validation'

// FIXME - this isn't supported by any of the types, can we remove it??
export function present(): Validation {
  const constraint = $({ present: $.path() })
  return Validation.fromConstraint('present', constraint)
}
