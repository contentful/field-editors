import { parseNumber } from './parseNumber';

describe('parseNumber', () => {
  it('should parse values properly', () => {
    expect(parseNumber('1', 'Integer')).toEqual({ isValid: true, value: 1 });
    expect(parseNumber('-99', 'Interger')).toEqual({ isValid: true, value: -99 });
    expect(parseNumber('2.89', 'Integer')).toEqual({ isValid: false, value: 2 });
    expect(parseNumber('foo', 'Integer')).toEqual({ isValid: false, value: undefined });

    expect(parseNumber('1', 'Number')).toEqual({ isValid: true, value: 1 });
    expect(parseNumber('-99', 'Number')).toEqual({ isValid: true, value: -99 });
    expect(parseNumber('2.89', 'Number')).toEqual({ isValid: true, value: 2.89 });
    expect(parseNumber('-12.89', 'Number')).toEqual({ isValid: true, value: -12.89 });
    expect(parseNumber('foo', 'Number')).toEqual({ isValid: false, value: undefined });
  });
});
