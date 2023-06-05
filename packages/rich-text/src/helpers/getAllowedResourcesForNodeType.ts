/* eslint-disable you-dont-need-lodash-underscore/find */
import find from 'lodash/find';
import flow from 'lodash/flow';
import get from 'lodash/get';

type AllowedResource = {
  type: 'Contentful:Entry';
  source: string;
  contentTypes: string[];
};

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
 *
 * @param {object} field
 * @param {string} nodeType
 * @returns {AllowedResource[]}
 */
export default function getAllowedResourcesForNodeType(field, nodeType): AllowedResource[] {
  return flow(
    (validations) => find(validations, 'nodes'),
    (validations) => get(validations, ['nodes', nodeType, 'allowedResources'], [])
  )(field.validations);
}
