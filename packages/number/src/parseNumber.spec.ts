import { parseNumber, isNumberInputValueValid } from './parseNumber';

describe('parseNumber', () => {
  it('should parse values properly when type is Integer', () => {
    expect(parseNumber('1', 'Integer')).toBe(1);
    expect(parseNumber('-99', 'Interger')).toEqual(-99);
    expect(parseNumber('2.89', 'Integer')).toBe(2);
    expect(parseNumber('foo', 'Integer')).toBeUndefined();
  });

  it('should parse values properly when type is Number', () => {
    expect(parseNumber('1', 'Decimal')).toBe(1);
    expect(parseNumber('-99', 'Decimal')).toEqual(-99);
    expect(parseNumber('2.89', 'Decimal')).toBe(2.89);
    expect(parseNumber('-12.89', 'Decimal')).toEqual(-12.89);
    expect(parseNumber('foo', 'Decimal')).toBeUndefined();
  });
});

describe('isNumberInputValueValid', () => {
  it('should correctrly validate input when type is Integer', () => {
    expect(isNumberInputValueValid('3', 'Integer')).toBe(true);
    expect(isNumberInputValueValid('33', 'Integer')).toBe(true);
    expect(isNumberInputValueValid('+', 'Integer')).toBe(true);
    expect(isNumberInputValueValid('-', 'Integer')).toBe(true);
    expect(isNumberInputValueValid('-3', 'Integer')).toBe(true);

    expect(isNumberInputValueValid('--', 'Integer')).toBe(false);
    expect(isNumberInputValueValid('++', 'Integer')).toBe(false);
    expect(isNumberInputValueValid('.3', 'Integer')).toBe(false);
    expect(isNumberInputValueValid('0.3', 'Integer')).toBe(false);
    expect(isNumberInputValueValid('3.3', 'Integer')).toBe(false);
    expect(isNumberInputValueValid('foo', 'Integer')).toBe(false);
  });

  it('should correctrly validate input when type is Number', () => {
    expect(isNumberInputValueValid('3', 'Decimal')).toBe(true);
    expect(isNumberInputValueValid('33', 'Decimal')).toBe(true);
    expect(isNumberInputValueValid('+', 'Decimal')).toBe(true);
    expect(isNumberInputValueValid('-', 'Decimal')).toBe(true);
    expect(isNumberInputValueValid('-3', 'Decimal')).toBe(true);
    expect(isNumberInputValueValid('3.3', 'Decimal')).toBe(true);
    expect(isNumberInputValueValid('-3.3', 'Decimal')).toBe(true);
    expect(isNumberInputValueValid('0', 'Decimal')).toBe(true);
    expect(isNumberInputValueValid('.', 'Decimal')).toBe(true);
    expect(isNumberInputValueValid('.3', 'Decimal')).toBe(true);
    expect(isNumberInputValueValid('0.3', 'Decimal')).toBe(true);

    expect(isNumberInputValueValid('--', 'Integer')).toBe(false);
    expect(isNumberInputValueValid('++', 'Integer')).toBe(false);
    expect(isNumberInputValueValid('foo', 'Integer')).toBe(false);
    expect(isNumberInputValueValid('0.3.', 'Integer')).toBe(false);
    expect(isNumberInputValueValid('0.3.3', 'Integer')).toBe(false);
    expect(isNumberInputValueValid('..', 'Integer')).toBe(false);
  });
});
