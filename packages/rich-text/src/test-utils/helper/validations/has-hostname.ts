import _ from 'lodash'
import { Validation } from '../validation'
import { getHostnameRegex } from './utils/hostname'

export function hasHostname(args: Record<string, any>): Validation {
  const subDomains = _.flatten([args.subDomain])
  const domains = _.flatten([args.domain])
  const regexp = getHostnameRegex(subDomains, domains)

  function test(value: any): boolean {
    if (args.allowEmpty && value === '') {
      return true
    }

    // `new URL` requires a protocol
    if (value.startsWith('//')) {
      value = `http:${value}`
    }

    try {
      const url = new URL(value)
      return Boolean(url.hostname.match(regexp))
    } catch {
      return false
    }
  }

  return Validation.fromTestFunction('hasHostname', test, {
    constraint: regexp.source,
  })
}
