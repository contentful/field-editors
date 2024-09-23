import { FieldAPI } from '@contentful/field-editor-shared';
import { nanoid } from 'nanoid';

type DropdownOption = {
  id: string;
  value: string | number | undefined;
  label: string;
};

export function parseValue(value: string, fieldType: string): string | number | undefined {
  if (value === '') {
    return undefined;
  }
  if (fieldType === 'Integer' || fieldType === 'Number') {
    const asNumber = Number(value);
    return isNaN(asNumber) ? undefined : asNumber;
  }
  return value;
}

export function getOptions(field: FieldAPI): DropdownOption[] {
  // Get first object that has a 'in' property
  const validations = field.validations || [];
  const predefinedValues = validations
    .filter((validation) => (validation as any).in)
    .map((validation) => (validation as any).in);

  const firstPredefinedValues = predefinedValues.length > 0 ? predefinedValues[0] : [];

  return firstPredefinedValues
    .map((value: string) => ({
      id: nanoid(6),
      value: parseValue(value, field.type),
      label: String(value),
    }))
    .filter((item: { value: string | number | undefined; label: string }) => {
      return item.value !== undefined;
    });
}
