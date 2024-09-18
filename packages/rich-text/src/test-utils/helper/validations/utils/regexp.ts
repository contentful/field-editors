import _ from 'lodash';
export function exists<T>(value?: T): value is NonNullable<T> {
  return typeof value !== 'undefined' && value !== null;
}

// TODO: we're using the native `RegExp` for validation.
// It exposes us to ReDoS attacks. We should inject a safe
// but backwards compatible regular expression engine here
// so we're not susceptible.
export const createRegExp = (pattern: string | RegExp, flags?: string): RegExp =>
  new RegExp(pattern, flags);

export function checkRegexp(args: Partial<{ pattern: string; flags: string }>): void {
  if (!_.isObject(args)) {
    throw new Error('Expected object as argument');
  }

  if (!exists(args.pattern as string)) {
    throw new Error('Expected pattern argument');
  }

  let parsed;

  try {
    if (exists(args.flags as string)) {
      parsed = args.pattern && createRegExp(args.pattern, args.flags);
    } else {
      parsed = args.pattern && createRegExp(args.pattern);
    }
  } catch (e) {
    parsed = false;
  }

  if (!parsed) {
    throw new Error('Invalid regular expression');
  }
}
