/* eslint-disable */
// 3rd-party modules
import _ from 'lodash';

// Local modules
import * as localeHelper from './locale';
import { BLOCKS, Document, INLINES, V1_NODE_TYPES } from '@contentful/rich-text-types';
import { getErrorMessage } from './validation-error-messages';
import { ValidationError } from '../schema';
import { getRichTextResourceLinks } from '@contentful/rich-text-links';
import { Validation } from './validation';
import { isEntryFromValidSource } from '@contentful/resource-names';
import { DEFAULT_ENVIRONMENT_ID, RICH_TEXT_RESOURCE_LINKS_NODE_TYPES } from './constants';
import { ContentFields } from 'contentful-management';

const getKeyFromEntityMap: { [key: string]: (entity: Record<string, any>) => string } = {
  'Contentful:Entry': (entity: Record<string, any>) => entity.sys.urn,
  Entry: (entity: Record<string, any>) => entity.sys.id,
  Asset: (entity: Record<string, any>) => entity.sys.id,
};

/**
 * Prepend path to each of the item's path properties and return
 * a list of copies of the items.
 */
function prefixPaths(
  path: (Record<string, any> | string | number)[],
  items: ValidationError[]
): ValidationError[] {
  return _.map(items, (item) =>
    _.assign({}, item, {
      path: item.path ? [...path, ...item.path] : path,
    })
  );
}

/**
 * Validate `value` against `schema.type` and `schema.validations`
 * and return the errors for both.
 */
function errors(
  value: Record<string, any> | number,
  schema: Record<string, any>,
  context?: Record<string, any>
): ValidationError[] {
  context = context || {};

  // FIXME Terrible hack to workaround our schemas not supporting something similar to
  // https://spacetelescope.github.io/understanding-json-schema/reference/combining.html#anyof

  // The schema is cloned here as the type validation might modify the schema
  schema = _.cloneDeep(schema);
  const typeErrors = validateType(value, schema, context);
  if (
    schema.isNonDefaultLocaleOfNonLocalizedField &&
    context.onlyTypeValidationForNonDefaultLocalesOfNonLocalizedFields
  ) {
    return typeErrors;
  }

  const validationErrors = validateValidations(value, schema, context);
  const allowedResourceErrors = validateAllowedResources(value, schema, context);
  return [...typeErrors, ...validationErrors, ...allowedResourceErrors];
}
/**
 * Creating an internal representation of all the entities inside context
 * that maps the entities with their ids in case of internal entities or their Urns for easier lookup
 */
function mapIncludesEntities(context: Record<string, any>): { [key: string]: Record<string, any> } {
  const includesByTypeAndKey: { [key: string]: Record<string, any> } = {};
  for (const [entityType, entities] of Object.entries(context.includes)) {
    const getKeyFn = getKeyFromEntityMap[entityType];
    if (!getKeyFn) {
      continue;
    }
    const keyEntityPairs = (entities as Record<string, any>[]).map((entity) => [
      getKeyFn(entity),
      entity,
    ]);
    includesByTypeAndKey[entityType] = Object.fromEntries(keyEntityPairs);
  }
  const skipIncludesValidationByType: { [key: string]: Record<string, any> } = {};
  for (const [entityType, keys] of Object.entries(context.skipIncludesValidation || {})) {
    skipIncludesValidationByType[entityType] = new Set(keys as string[]);
  }
  const transformedContext: { [key: string]: Record<string, any> } = {
    ...context,
    includes: includesByTypeAndKey,
  };
  if (Object.keys(skipIncludesValidationByType).length) {
    transformedContext.skipIncludesValidation = skipIncludesValidationByType;
  }
  return transformedContext;
}

/**
 * Validate `value` against the schema's type. Returns a list of
 * errors.
 */
function validateType(
  value: Record<string, any> | number,
  schema: Record<string, any>,
  context: Record<string, any>
): ValidationError[] {
  // FIXME We have to require this locally because of a circular
  // dependency
  const types = require('../types').types; // eslint-disable-line
  const type = types[schema.type];

  if (!type) {
    throw new TypeError('Unknown type: ' + schema.type);
  }

  let isValid;
  if (_.isFunction(type)) {
    isValid = type(value, schema, context);
  } else if (_.isObject(type)) {
    // type is a schema description. We have to build the validator.
    const objectValidator = types.Object;
    isValid = objectValidator(value, type, context);
  } else {
    throw new Error('Unknown type definition');
  }

  if (isValid === true) {
    return [];
  } else if (isValid === false) {
    return [
      {
        name: 'type',
        value,
        type: schema.type,
        details: 'The type of "value" is incorrect, expected type: ' + schema.type,
      },
    ];
  } else {
    return isValid;
  }
}

/**
 * Validate `value` against the schema's custom validations. Returns a
 * list of errors.
 */
function validateValidations(
  value: Record<string, any> | number,
  schema: Record<string, any>,
  context: Record<string, any>
): ValidationError[] {
  if (context.skipValidations && !schema.strict) {
    return [];
  }

  return _.reduce(
    getValidations(schema),
    (errors: ValidationError[], object: Record<string, any>) => {
      const validation = Validation.parse(object, schema.type);

      return [...errors, ...validation.errors(value, context)];
    },
    []
  );
}

function getValidations(schema: Record<string, any>): Record<string, any>[] {
  return schema.type === 'RichText' ? getRichTextSchemaValidations(schema) : schema.validations;
}

function validateAllowedResources(
  value: Record<string, any> | number,
  schema: Record<string, any>,
  context: Record<string, any>
): ValidationError[] {
  if (
    !context.includes ||
    !schema.allowedResources ||
    (context.skipValidations && !schema.strict) ||
    schema.type === 'Array' ||
    typeof value === 'number'
  ) {
    return [];
  }

  const errors: ValidationError[] = [];
  if (value.nodeType === BLOCKS.DOCUMENT) {
    RICH_TEXT_RESOURCE_LINKS_NODE_TYPES.forEach((nodeType) => {
      const resourceLinks = getRichTextResourceLinks(value as Document, nodeType, {
        deduplicate: true,
      });
      for (const resourceLink of resourceLinks) {
        const error = getRichTextAllowedResourcesValidationError(
          resourceLink,
          schema,
          context,
          nodeType
        );
        if (error) {
          errors.push(error);
        }
      }
    });
  } else {
    const error = getAllowedResourcesValidationError(value, schema, context);
    if (error) {
      errors.push(error);
    }
  }
  return errors;
}

function getAllowedResourcesValidationError(
  value: Record<string, any>,
  schema: Record<string, any>,
  context: Record<string, any>
): ValidationError | undefined {
  const resourceUrn = value.sys.urn;

  if (value.sys.linkType.startsWith('Contentful:')) {
    const allowedResourceItemForSpace = schema.allowedResources.find(
      (allowedResourcesItem: Record<string, any>) =>
        isEntryFromValidSource({
          entryCrn: resourceUrn,
          allowedResourceCrn: allowedResourcesItem.source,
          defaultEnvironmentId: DEFAULT_ENVIRONMENT_ID,
        })
    );

    if (!allowedResourceItemForSpace) {
      // the urn is invalid regardless of the resource data
      return {
        name: 'allowedResources',
        details: getErrorMessage({ name: 'allowedResources' }),
        value,
      };
    }
    const skipValidationUrns =
      context.skipIncludesValidation && context.skipIncludesValidation['Contentful:Entry'];
    if (skipValidationUrns && skipValidationUrns.has(resourceUrn)) {
      return undefined;
    }

    const entries = context.includes['Contentful:Entry'] || {};
    const resource = entries[resourceUrn];

    if (
      !resource ||
      !allowedResourceItemForSpace.contentTypes.includes(resource.sys.contentType.sys.id)
    ) {
      return {
        name: 'allowedResources',
        details: getErrorMessage({
          name: 'allowedResources',
          params: allowedResourceItemForSpace.contentTypes,
        }),
        value: null,
        contentTypeId: allowedResourceItemForSpace.contentTypes,
      };
    }
  }

  return undefined;
}

function getRichTextAllowedResourcesValidationError(
  value: Record<string, any>,
  schema: Record<string, any>,
  context: Record<string, any>,
  nodeType: INLINES | BLOCKS
): ValidationError | undefined {
  const resourceUrn = value.sys.urn;
  const allowedResourceItemForSpace = schema.allowedResources[nodeType].find(
    (allowedResourcesItem: Record<string, any>) =>
      isEntryFromValidSource({
        entryCrn: resourceUrn,
        allowedResourceCrn: allowedResourcesItem.source,
        defaultEnvironmentId: DEFAULT_ENVIRONMENT_ID,
      })
  );

  if (!allowedResourceItemForSpace) {
    // the urn is invalid regardless of the resource data
    return {
      name: 'allowedResources',
      details: getErrorMessage({ name: 'allowedResources' }),
      value,
    };
  }

  const skipValidationUrns =
    context.skipIncludesValidation && context.skipIncludesValidation['Contentful:Entry'];
  if (skipValidationUrns && skipValidationUrns.has(resourceUrn)) {
    return undefined;
  }

  const entries = context.includes['Contentful:Entry'] || {};
  const resource = entries[resourceUrn];

  if (
    !resource ||
    !allowedResourceItemForSpace.contentTypes.includes(resource.sys.contentType.sys.id)
  ) {
    return {
      name: 'allowedResources',
      details: getErrorMessage({
        name: 'allowedResources',
        params: allowedResourceItemForSpace.contentTypes,
      }),
      value: null,
      contentTypeId: allowedResourceItemForSpace.contentTypes,
    };
  }

  return undefined;
}
/**
 * Relates to:
 * https://contentful.atlassian.net/wiki/spaces/ENG/pages/3515088933/CEP-0129+Rich+text+node+types+validation+update
 */
function getRichTextSchemaValidations(schema: Record<string, any>): Record<string, any>[] {
  const validations = schema.validations || [];
  if (validations.some((v: Record<string, any>) => v.enabledNodeTypes)) {
    // Why we're checking to see if the validation exists at all:
    //
    // `enabledNodeTypes` = undefined or nonexistent - enable everything
    // In this case we want to enable everything _other than_ the types
    // that came out since this logic was implemented. In the future, this
    // won't be an issue because `enabledNodeTypes` will be required opt-in.
    //
    // `enabledNodeTypes` = [] - everything other than doc/paragraph/text is disabled
    // In this case we want to respect the existing validation.
    return validations;
  }
  return [...validations, { enabledNodeTypes: V1_NODE_TYPES }];
}

function isResourceLink(field: any | ContentFields): boolean {
  return field.type === 'Array'
    ? field.items?.type === 'ResourceLink'
    : field.type === 'ResourceLink';
}

export { localeHelper as locale, prefixPaths, errors, mapIncludesEntities, isResourceLink };
