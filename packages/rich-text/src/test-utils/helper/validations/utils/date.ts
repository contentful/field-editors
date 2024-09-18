import moment from 'moment'

/**
 * Transforms a `Date` instance, an epoch timestamp or an ISO-8601
 * string into a `moment` value.
 *
 * If the parsing failed it returns an invalid moment.
 */
export function getMoment(value: Date | number | string): moment.Moment {
  if (value instanceof Date || typeof value === 'number') {
    return moment(value)
  } else if (typeof value === 'string') {
    return moment(value, moment.ISO_8601)
  } else {
    return moment.invalid()
  }
}
