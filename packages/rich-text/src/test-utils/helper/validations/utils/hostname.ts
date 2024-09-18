import { createRegExp } from './regexp'

export function getHostnameRegex(subDomains: string[], domains: string[]): RegExp {
  const regexpString = `^(${subDomains.join('|')}).(${domains.join('|')})`
  return createRegExp(regexpString.replace(/\./g, '\\.'))
}
