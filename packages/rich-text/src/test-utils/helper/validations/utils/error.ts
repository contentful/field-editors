import type { Validation } from '../../validation';
import { getErrorMessage } from '../../validation-error-messages';
import _ from 'lodash';
import { ValidationError } from '../../../schema';

/** Builds an error */
export function buildError(
  validation: Validation,
  error: Record<string, any>,
  value: any
): ValidationError {
  const { name, params, customMessage, additionalErrorDetails } = validation;
  const errorMessage = getErrorMessage({ name, code: error.code, params, details: error.details });
  const details = errorMessage || error.details;
  const baseError: Record<string, any> = { name, details, value };

  if (customMessage) {
    baseError.customMessage = customMessage;
  }

  // @TODO amend ValidationError type to be compatible with buildError output
  return Object.assign(
    {},
    baseError,
    // regression: `validations` is being added at some point again
    _.omit(additionalErrorDetails, ['type', 'validations']),
    _.omit(error, 'details')
  ) as ValidationError;
}
