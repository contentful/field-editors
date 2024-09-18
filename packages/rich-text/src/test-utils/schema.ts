import _ from 'lodash';
import { mapIncludesEntities, errors as errorsHelper } from './helper';

export type ValidationError = {
  name: string;
  type?: string;
  value?: Record<string, any> | string | number | boolean | null;
  min?: number | string;
  max?: number | string;
  details?: string | null;
  path?: (string | number)[];
  contentTypeId?: string | string[];
  nodeType?: string;
  customMessage?: string;
  expected?: string[];
};

export class Schema {
  locales?: any[];

  constructor(options: Record<string, any>) {
    _.extend(this, options);
  }

  static create(object: Record<string, any>): any {
    return new this(object);
  }

  at(path: string[]): Record<string, any> {
    return _.reduce(
      path,
      function (schema: Record<string, any>, property: string) {
        if (!schema.properties || !(property in schema.properties)) {
          throw new Error('No schema at ' + path.join('.'));
        }
        return Schema.create(schema.properties[property]);
      },
      this
    );
  }

  atItems(path: string[]): Record<string, any> {
    return _.reduce(
      path,
      function (schema: Record<string, any>, property: string) {
        if (!schema.properties || !(property in schema.properties)) {
          throw new Error('No schema at ' + path.join('.'));
        }
        const subSchema = schema.properties[property];

        if (subSchema.type === 'Array') {
          return Schema.create(subSchema.items);
        }
        return Schema.create(subSchema);
      },
      this
    );
  }

  has(path: string[]): boolean {
    try {
      this.at(path);
    } catch (e) {
      return false;
    }

    return true;
  }

  hasItems(path: string[]): boolean {
    try {
      this.atItems(path);
    } catch (e) {
      return false;
    }

    return true;
  }

  /**
   * Schema.errors must be only called once at the top of the validation stack
   * multiple recursive calls should use errors instead so we only transform the context once
   */
  errors(value: any, context?: Record<string, any>): ValidationError[] {
    if (context && context.includes) {
      context = mapIncludesEntities(context);
    }
    return errorsHelper(value, this, context);
  }

  validate(value: any, context?: Record<string, any>): boolean {
    return _.isEmpty(this.errors(value, context));
  }

  localeInternalCodes(): string[] {
    return (this.locales || []).map(function (locale: any) {
      return locale.internal_code;
    });
  }
}
