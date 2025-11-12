"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    newEntitySelectorConfigFromRichTextField: function() {
        return newEntitySelectorConfigFromRichTextField;
    },
    newResourceEntitySelectorConfigFromRichTextField: function() {
        return newResourceEntitySelectorConfigFromRichTextField;
    }
});
const _getAllowedResourcesForNodeType = /*#__PURE__*/ _interop_require_default(require("./getAllowedResourcesForNodeType"));
const _getLinkedContentTypeIdsForNodeType = /*#__PURE__*/ _interop_require_default(require("./getLinkedContentTypeIdsForNodeType"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const newEntitySelectorConfigFromRichTextField = (field, nodeType)=>{
    return {
        entityType: getEntityTypeFromRichTextNode(nodeType),
        locale: field.locale || null,
        contentTypes: (0, _getLinkedContentTypeIdsForNodeType.default)(field, nodeType)
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
const newResourceEntitySelectorConfigFromRichTextField = (field, nodeType)=>{
    return {
        allowedResources: (0, _getAllowedResourcesForNodeType.default)(field, nodeType),
        locale: field.locale
    };
};
