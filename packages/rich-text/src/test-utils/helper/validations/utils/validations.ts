import _ from 'lodash';
import { Validation } from '../../validation';
import { isLinkField } from '../link-field';

export function quote(s: string | number): string {
  return JSON.stringify(s);
}

export function getValidationForConfigFn<TArgs extends Array<any>>(
  createValidationFns: Record<string, (config: any, ...additionalArgs: TArgs) => Validation>
) {
  return function getValidationForConfig(
    config: Record<string, any>,
    ...additionalArgs: TArgs
  ): Validation {
    const [names, description] = [createValidationFns, config].map(_.keys);
    const validationNames = _.intersection(names, description);

    if (validationNames.length === 0) {
      let message;

      if (description.length > 1) {
        message = `None of the properties ${description.map(quote).join(', ')} are `;
      } else {
        message = `The property ${quote(description[0])} isn't `;
      }

      throw new Error(`${message} a recognized validation type`);
    }

    if (validationNames.length > 1) {
      throw new Error(
        'This validation is ambiguous; each of the properties ' +
          validationNames.map(quote).join(', ') +
          ' could be the validation type'
      );
    }

    const [name] = validationNames;
    const createValidationFn = createValidationFns[name];
    const validationConfig = config[name];

    const validation = createValidationFn(validationConfig, ...additionalArgs);
    validation.customMessage = config.message;

    return validation;
  };
}

const FIELD_VALIDATIONS = {
  Array: ['size'],
  Date: ['dateRange'],
  Integer: ['in', 'range', 'unique'],
  Number: ['in', 'range', 'unique'],
  Object: ['size'],
  RichText: ['size', 'nodes', 'enabledNodeTypes', 'enabledMarks'],
  Symbol: ['in', 'regexp', 'prohibitRegexp', 'size', 'unique'],
  Text: ['in', 'regexp', 'prohibitRegexp', 'size'],
  ResourceLink: [],
  Boolean: [],
  Location: [],
  Link: [],
} as const;

const LINK_FIELD_VALIDATIONS = {
  Entry: ['linkContentType', 'relationshipType'],
  Asset: ['linkMimetypeGroup', 'assetFileSize', 'assetImageDimensions', 'relationshipType'],
} as const;

/**
 * Return a list of validation names that can be used on a field's
 * type.
 *
 * The function uses the `field.type` property to determine the
 * possible valdiations. If the type is 'Link' it uses `field.linkType`
 * to determine the available validations.
 */
export function validationNamesForField(field: any): any {
  if (isLinkField(field)) {
    return LINK_FIELD_VALIDATIONS[field.linkType];
  } else {
    //@ts-ignore
    return FIELD_VALIDATIONS[field.type];
  }
}
