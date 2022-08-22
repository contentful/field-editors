import { FieldAPI } from '@contentful/field-editor-shared';

type RangeValidation = { min?: number; max?: number };

export const getRangeFromField = (field: FieldAPI): RangeValidation => {
  const validations = field.validations || [];
  const result = validations.find((validation) => (validation as any).range) as
    | { range: RangeValidation }
    | undefined;
  return result ? result.range : {};
};

export const valueToString = (value: number | null | undefined) => {
  return value === undefined ? '' : String(value);
};

export const countDecimals = (number: number) => {
  return number.toString().split('.')[1]?.length ?? 0;
};
