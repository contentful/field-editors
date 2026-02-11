import { FieldAppSDK } from '@contentful/app-sdk';
import { BLOCKS } from '@contentful/rich-text-types';
import { find, flow, get } from 'lodash';

const isFormattingOptionEnabled = (
  field: FieldAppSDK['field'],
  type: 'enabledNodeTypes' | 'enabledMarks',
  nodeOrMark: string,
): boolean => {
  const enabledTypes = flow(
    (v) => find(v, type),
    (v) => get(v, type),
  )(field.validations);

  if (!enabledTypes) {
    return true;
  }

  return enabledTypes.includes(nodeOrMark);
};

export const isNodeEnabled = (field: FieldAppSDK['field'], nodeType: string): boolean => {
  if (nodeType === BLOCKS.DOCUMENT || nodeType === BLOCKS.PARAGRAPH || nodeType === 'text') {
    return true;
  }

  return isFormattingOptionEnabled(field, 'enabledNodeTypes', nodeType);
};

export const isMarkEnabled = (field: FieldAppSDK['field'], mark: string) =>
  isFormattingOptionEnabled(field, 'enabledMarks', mark);

/**
 * Given a field object and a rich text node type, return a list of valid
 * content type IDs associated with the node type, based on that node type's
 * `linkContentType` validation.
 *
 * If there is no such validation or the validation is empty, return an empty
 * array.
 *
 * The navigation here is explained by the `nodes` validation having signature:
 * { nodes: { [nodeType]: validationObject[] } }
 *
 * We defensively navigate through this object because
 * 1) the field may not have a `validations` array,
 * 2) the `validations` array may be empty,
 * 3) the `validations` array may not have a `nodes` validation,
 * 4) the `nodes` validation may not validate the `nodeType`, and
 * 5) the `nodeType` validations may not have a `linkContentType` validation.
 *
 * Note that passing an empty array will result in all possible content types
 * being whitelisted.
 */
export function getLinkedContentTypeIdsForNodeType(
  field: FieldAppSDK['field'],
  nodeType: string,
): string[] {
  return flow(
    (v) => find(v, 'nodes'),
    (v) => get(v, ['nodes', nodeType]),
    (v) => find(v, 'linkContentType'),
    (v) => get(v, 'linkContentType', []),
  )(field.validations);
}

/**
 * Given a field object and a rich text node type, return a list of allowed
 * resources associated with the node type, based on that node type's
 * `allowedResources` property.
 *
 * The navigation here is explained by the `nodes` validation having signature:
 * { nodes: { [nodeType]: { allowedResources: AllowedResource[] } } }
 *
 * We defensively navigate through this object because
 * 1) the field may not have a `validations` array,
 * 2) the `validations` array may be empty,
 * 3) the `validations` array may not have a `nodes` validation, and
 * 4) the `nodes` validation may not validate the `nodeType`.
 */
export function getAllowedResourcesForNodeType(
  field: FieldAppSDK['field'],
  nodeType: string,
): {
  type: 'Contentful:Entry';
  source: string;
  contentTypes: string[];
}[] {
  return flow(
    (v) => find(v, 'nodes'),
    (v) => get(v, ['nodes', nodeType, 'allowedResources'], []),
  )(field.validations);
}
