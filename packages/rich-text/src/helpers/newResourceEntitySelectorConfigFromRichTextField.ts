import getAllowedResourcesForNodeType from './getAllowedResourcesForNodeType';

/**
 * Returns a config for the entity selector based on a given rich text field and a
 * rich text node type that the entity should be picked for. Takes the field
 * validations for the given node type into account.
 *
 * @param {object} field
 * @param {string} nodeType
 * @returns {object}
 */
export default function newResourceEntitySelectorConfigFromRichTextField(field, nodeType) {
  return {
    allowedResources: getAllowedResourcesForNodeType(field, nodeType),
  };
}
