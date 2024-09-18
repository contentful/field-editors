import { Schema } from '../../schema';
import { Validation } from '../validation';
import { isDefaultValueSupported } from './utils/default-value';

export function matchingDefaultFieldValueType(): Validation {
  const makeMismatchingDefaultFieldValueError = function (
    fieldIndex: any,
    fieldLocale: any,
    value: any
  ): any {
    const error = {
      path: [fieldIndex, 'defaultValue', fieldLocale],
      value,
    };
    return error;
  };

  const validation = function (fields: any[]): { path: (number | string)[]; value: any }[] {
    const errors = [] as any;
    for (const [index, field] of fields.entries()) {
      if (!field.defaultValue || !isDefaultValueSupported(field)) {
        continue;
      }

      for (const [locale, value] of Object.entries(field.defaultValue)) {
        const valueSchema = Schema.create({
          type: field.type,
          items: field.items && {
            type: field.items.type,
          },
        });
        if (value !== null && !valueSchema.validate(value)) {
          errors.push(makeMismatchingDefaultFieldValueError(index, locale, value));
        }
      }
    }
    return errors;
  };

  return new Validation('matchingDefaultFieldValueType', validation);
}
