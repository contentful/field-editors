import isEmpty from 'lodash/isEmpty';

export function parseNumber(
  value: string,
  type: string
): {
  isValid: boolean;
  value: number | undefined;
} {
  // This has saner semantics than parseFloat.
  // For values with chars in 'em, it gives
  // us NaN unlike parseFloat
  const floatVal = +value;
  const hasDot = /\./g.test(value);
  const hasFractional = /\.\d+/g.test(value);

  if (isEmpty(value)) {
    return {
      isValid: true,
      value: undefined
    };
  }

  if (isNaN(floatVal)) {
    return {
      isValid: false,
      value: undefined
    };
  }

  if (type === 'Integer' && hasDot) {
    const intVal = parseInt(value, 10);

    return {
      isValid: false,
      value: intVal
    };
  }

  if (hasDot && !hasFractional) {
    return {
      isValid: false,
      value: floatVal
    };
  }

  return {
    isValid: true,
    value: floatVal
  };
}
