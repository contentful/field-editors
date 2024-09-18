import { getValidationForConfig } from './validations';
import { buildError } from './validations/utils/error';
import { ValidationError } from '../schema';
import _ from 'lodash';

export function exists<T>(value?: T): value is NonNullable<T> {
  return typeof value !== 'undefined' && value !== null;
}

export function pickExisting(...args: any[]): Record<string, any> {
  const collection = args.shift();

  if (args.length === 0) {
    return _.pickBy(collection, exists);
  } else {
    return _.pickBy(collection, function (value, key) {
      return exists(value) && args.indexOf(key) >= 0;
    });
  }
}

export function quote(s: string | number): string {
  return JSON.stringify(s);
}

/**
 * A validation provides a `test` method that takes a value and returns
 * `true` if it passes the validation and `false` otherwise.
 *
 * In addition, a validation may provide `name` and `details` string
 * properties.
 *
 * Validations are deserialized through `Validation.parse`.
 */
export class Validation {
  params: Record<string, any>;
  additionalErrorDetails: Record<string, any>;
  name: string;
  private readonly _errors: (
    value: any,
    context: Record<string, any>
  ) => Record<string, any>[] | void;
  constraint?: any;
  customMessage?: string;

  constructor(
    name: string,
    errors: (value: any, context: Record<string, any>) => Record<string, any>[] | void,
    options?: Record<string, any>
  ) {
    if (options) {
      options = pickExisting(options);
    } else {
      options = {};
    }
    this.params = options.params;
    this.additionalErrorDetails = _.omit(options, 'params');
    this.name = name;
    this._errors = errors;

    // FIXME for backwards compatibility. Remove on next major release
    Object.assign(this, options);
  }

  static fromTestFunction(
    name: string,
    testFn: (value: any, context: Record<string, any>) => boolean,
    options?: Record<string, any>
  ): Validation {
    return new this(name, (...args) => (testFn(...args) ? [] : [{}]), options);
  }

  static fromConstraint(name: string, constraint: any, options?: Record<string, any>): Validation {
    const test = function (value: any): boolean {
      try {
        return constraint.test(value);
      } catch (e) {
        return false;
      }
    };

    const validation = this.fromTestFunction(name, test, options);
    validation.constraint = constraint;
    return validation;
  }

  static fromValidationArray(
    name: string,
    validations: Validation[],
    options: Record<string, any> = {}
  ): Validation {
    return new this(
      name,
      (...args) => validations.flatMap((validation) => validation.errors(...args)),
      {
        validations,
        ...options,
      }
    );
  }

  /**
   * Return an array of validation errors.
   *
   * If the validation was successful, it returns an empty array.
   */
  errors(value: any, context: Record<string, any>): ValidationError[] {
    const errors = this._errors(value, context) || [];

    return _.map(errors, (error) => buildError(this, error, value));
  }

  /**
   * @deprecated
   */
  toError(value: any, context: Record<string, any>): Record<string, any> {
    return this.errors(value, context);
  }

  test(value: any, context: Record<string, any>): boolean {
    return this.errors(value, context).length === 0;
  }

  // /**
  //  * Turn a validation description into a constraint.
  //  *
  //  * The `description` is an object with a single key value pair. The key
  //  * is the name of the validation and the value is the parameters for
  //  * the validation.
  //  *
  //  * The function returns a validation, that is an object with a `test`
  //  * method that runs the validation on a value.
  //  */
  static parse(rules: Record<string, any>, fieldType?: string): Validation {
    return getValidationForConfig(rules, fieldType);
  }
}
