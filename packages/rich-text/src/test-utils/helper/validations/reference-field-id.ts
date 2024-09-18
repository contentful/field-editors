import _ from 'lodash';
import { Validation } from '../validation';
export function exists<T>(value?: T): value is NonNullable<T> {
  return typeof value !== 'undefined' && value !== null;
}

export function referencesFieldId(attrName: string): Validation {
  if (!attrName) {
    throw new Error('Expected attribute name as first argument.');
  }

  function validate(
    data: Record<string, any>
  ): { displayFieldValue: string; allowedValues: string[] }[] | void {
    const value = data[attrName];
    const fieldIds = _.map(data.fields || [], 'id');

    if (exists(value) && !_.includes(fieldIds, value)) {
      return [
        {
          displayFieldValue: value,
          allowedValues: fieldIds,
        },
      ];
    }
  }

  return new Validation('referencesFieldId', validate, { params: attrName });
}
