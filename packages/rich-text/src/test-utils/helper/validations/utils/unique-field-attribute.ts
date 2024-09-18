import _ from 'lodash';
import camelize from 'camelize';
import { Validation } from '../../validation';

export function createUniqueFieldAttributeValidation(
  attributeName: string,
  options?: Record<string, any>
): Validation {
  function validate(
    fields: any[]
  ): ({ path: (number | string)[]; value: any } & Record<string, any>)[] {
    const duplicates = _.reduce(
      fields,
      function (duplicates, field, index) {
        if (options && options.skipDeleted && field.deleted) {
          return duplicates;
        }

        const value = (field as unknown as { [key: string]: number })[attributeName];

        if (typeof value !== 'string') {
          return duplicates;
        }

        if (!(value in duplicates)) {
          duplicates[value] = [];
        }

        duplicates[value].push(index);

        return duplicates;
      },
      {} as Record<string, number[]>
    );

    return _.reduce(
      duplicates,
      function (errors, fieldIndices, value) {
        if (fieldIndices.length > 1) {
          fieldIndices.forEach(function (fieldIndex) {
            errors.push(makeDuplicateError(fieldIndex, value));
          });
        }
        return errors;
      },
      [] as ({ path: (number | string)[]; value: any } & Record<string, any>)[]
    );

    function makeDuplicateError(
      fieldIndex: number,
      value: string
    ): { path: (number | string)[]; value: any } & Record<string, any> {
      const error: { path: (number | string)[]; value: any } & Record<string, any> = {
        path: [fieldIndex, attributeName],
        value: fields[fieldIndex],
      };
      error[attributeName] = value;
      return error;
    }
  }

  const name = camelize('uniqueField-' + attributeName + 's');
  return new Validation(name, validate, { attributeName });
}
