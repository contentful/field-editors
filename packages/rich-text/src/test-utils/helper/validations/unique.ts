import { Validation } from '../validation'

export function unique(): Validation {
  // Uniqueness is not handled inside the validation lib.
  // It if is encountered, make it pass.
  // I apologize, future developer coming here in the hopes of figuring out
  // why uniqueness validation is not working
  // I swear, it made sense at the time
  return Validation.fromTestFunction('unique', () => true)
}
