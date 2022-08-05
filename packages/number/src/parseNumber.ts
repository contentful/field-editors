export function parseNumber(value: string, type: string) {
  if (Number.isNaN(+value)) {
    return;
  }

  return type === 'Integer' ? parseInt(value, 10) : parseFloat(value);
}

const FLOAT_REGEX = /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]*)?$/;
const INT_REGEX = /^[+-]?([0-9]*)$/;

export function isNumberInputValueValid(value: string, type: string) {
  const regex = type === 'Integer' ? INT_REGEX : FLOAT_REGEX;

  return regex.test(value);
}
