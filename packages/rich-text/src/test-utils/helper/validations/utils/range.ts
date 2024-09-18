export function exists<T>(value?: T): value is NonNullable<T> {
  return typeof value !== 'undefined' && value !== null;
}

/**
 * Return a function that checks if a value is between `min` and `max`.
 */
export function makeRangeCheck(min: number, max: number): (value: number) => boolean {
  return function (value: number) {
    if (!value) {
      return true;
    }

    let valid = true;

    if (exists(min)) {
      valid = valid && value >= min;
    }

    if (exists(max)) {
      valid = valid && value <= max;
    }
    return valid;
  };
}
