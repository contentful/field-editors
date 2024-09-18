import { Validation } from '../validation';
import { isDefaultValueSupported } from './utils/default-value';

export function allowedDefaultValueFieldType(): Validation {
  return new Validation('allowedDefaultValueFieldType', (fields: any[]) => {
    const errors = [] as any;

    for (const [index, field] of fields.entries()) {
      if (!field.defaultValue || isDefaultValueSupported(field)) {
        continue;
      }
      errors.push({
        path: [index, 'defaultValue'],
        value: field.defaultValue,
      });
    }

    return errors;
  });
}
