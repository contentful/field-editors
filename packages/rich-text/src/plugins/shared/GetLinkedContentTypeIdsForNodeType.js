import _ from 'lodash';

/**
 * @name getLinkedContentTypeIdsForNodeType
 * @description
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
 * @param {object} field
 * @param {string} nodeType
 * @return {string[]}
 */
export default (field, nodeType) =>
  _.chain(field.validations)
    .find('nodes')
    .get('nodes')
    .get(nodeType)
    .find('linkContentType')
    .get('linkContentType', [])
    .value();
