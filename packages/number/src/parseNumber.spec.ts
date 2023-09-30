import { parseNumber, isNumberInputValueValid } from './parseNumber';

describe('parseNumber', () => {
  it('should parse values properly when type is Integer', () => {
    expect(parseNumber('1', 'Integer')).toBe(1);
    expect(parseNumber('0', 'Integer')).toBe(0);
    expect(parseNumber('-99', 'Interger')).toEqual(-99);
    expect(parseNumber('2.89', 'Integer')).toBe(2);
    expect(parseNumber('foo', 'Integer')).toBeUndefined();
  });

  it('should parse values properly when type is Number', () => {
    expect(parseNumber('1', 'Number')).toBe(1);
    expect(parseNumber('0', 'Integer')).toBe(0);
    expect(parseNumber('-99', 'Number')).toEqual(-99);
    expect(parseNumber('2.89', 'Number')).toBe(2.89);
    expect(parseNumber('-12.89', 'Number')).toEqual(-12.89);
    expect(parseNumber('foo', 'Number')).toBeUndefined();
  });
});

describe('isNumberInputValueValid', () => {
  it('should correctly validate input when type is Integer', () => {
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

  it('should correctly validate input when type is Number', () => {
    expect(isNumberInputValueValid('3', 'Number')).toBe(true);
    expect(isNumberInputValueValid('33', 'Number')).toBe(true);
    expect(isNumberInputValueValid('+', 'Number')).toBe(true);
    expect(isNumberInputValueValid('-', 'Number')).toBe(true);
    expect(isNumberInputValueValid('-3', 'Number')).toBe(true);
    expect(isNumberInputValueValid('3.3', 'Number')).toBe(true);
    expect(isNumberInputValueValid('-3.3', 'Number')).toBe(true);
    expect(isNumberInputValueValid('0', 'Number')).toBe(true);
    expect(isNumberInputValueValid('.', 'Number')).toBe(true);
    expect(isNumberInputValueValid('.3', 'Number')).toBe(true);
    expect(isNumberInputValueValid('0.3', 'Number')).toBe(true);

    expect(isNumberInputValueValid('--', 'Integer')).toBe(false);
    expect(isNumberInputValueValid('++', 'Integer')).toBe(false);
    expect(isNumberInputValueValid('foo', 'Integer')).toBe(false);
    expect(isNumberInputValueValid('0.3.', 'Integer')).toBe(false);
    expect(isNumberInputValueValid('0.3.3', 'Integer')).toBe(false);
    expect(isNumberInputValueValid('..', 'Integer')).toBe(false);
  });
});
