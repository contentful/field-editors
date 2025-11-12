import getAllowedResourcesForNodeType from './getAllowedResourcesForNodeType';
import getLinkedContentTypeIdsForNodeType from './getLinkedContentTypeIdsForNodeType';
export const newEntitySelectorConfigFromRichTextField = (field, nodeType)=>{
    return {
        entityType: getEntityTypeFromRichTextNode(nodeType),
        locale: field.locale || null,
        contentTypes: getLinkedContentTypeIdsForNodeType(field, nodeType)
    };
};
function getEntityTypeFromRichTextNode(nodeType) {
    const words = nodeType.split('-');
    if (words.indexOf('entry') !== -1) {
        return 'Entry';
    }
    if (words.indexOf('asset') !== -1) {
        return 'Asset';
    }
    throw new Error(`RichText node type \`${nodeType}\` has no associated \`entityType\``);
}
export const newResourceEntitySelectorConfigFromRichTextField = (field, nodeType)=>{
    return {
        allowedResources: getAllowedResourcesForNodeType(field, nodeType),
        locale: field.locale
    };
};
