import _ from 'lodash'
import { Validation } from '../validation'

export function linkContentType(contentTypeId: string | string[]): Validation {
  if (_.isString(contentTypeId)) {
    contentTypeId = [contentTypeId]
  }

  if (!_.isArray(contentTypeId)) {
    throw new TypeError('Expected String or Array as linkContentType validation argument')
  }

  if (!_.every(contentTypeId, _.isString)) {
    // This is a new check with a slightly different (and more clear) error
    // message, for backwards compatibility reasons. (Previously we would
    // allow Array<any> and simply do nothing in the case of junk values.)
    throw new TypeError('Expected String or Array<String> as linkContentType validation argument')
  }

  if (_.isEmpty(contentTypeId)) {
    throw new Error('Need at least one allowed Content Type')
  }

  const test = function (value: Record<string, any>, context: Record<string, any>): boolean {
    if (!value) {
      return false
    }

    if (!context.includes) {
      return value.sys.type === 'Link'
    }

    const entry = context.includes.Entry[value.sys.id]

    if (!entry) {
      return false
    }

    return _.includes(contentTypeId, entry.sys.contentType.sys.id)
  }

  return Validation.fromTestFunction('linkContentType', test, {
    contentTypeId,
    params: contentTypeId,
  })
}
