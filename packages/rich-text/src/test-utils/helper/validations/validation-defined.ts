import _ from 'lodash';
import { Validation } from '../validation';
import { validationNamesForField } from './utils/validations';

export function validationDefined(): Validation {
  function validate(
    field: any
  ): { type: string; path: (string | number)[]; details: { type: string; name: string } }[] {
    const { validations } = field;
    const allowedValidations = validationNamesForField(field);
    return _.reduce(
      validations,
      (errors, validationDescription, index) => {
        let name;

        try {
          name = Validation.parse(validationDescription).name;
        } catch (e) {
          return errors;
        }

        if (!_.includes(allowedValidations, name)) {
          errors.push({
            type: 'validationDefined',
            path: ['validations', index],
            details: {
              type: field.type,
              name,
            },
          });
        }

        return errors;
      },
      [] as { type: string; path: (string | number)[]; details: { type: string; name: string } }[]
    );
  }

  return new Validation('validationDefined', validate);
}
