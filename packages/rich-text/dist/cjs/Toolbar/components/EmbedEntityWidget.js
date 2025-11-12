"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EmbedEntityWidget", {
    enumerable: true,
    get: function() {
        return EmbedEntityWidget;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _richtexttypes = require("@contentful/rich-text-types");
const _ContentfulEditorProvider = require("../../ContentfulEditorProvider");
const _editor = require("../../helpers/editor");
const _validations = require("../../helpers/validations");
const _EmbeddedBlockToolbarIcon = require("../../plugins/shared/EmbeddedBlockToolbarIcon");
const _EmbeddedInlineToolbarIcon = require("../../plugins/shared/EmbeddedInlineToolbarIcon");
const _SdkProvider = require("../../SdkProvider");
const _EmbeddedEntityDropdownButton = require("./EmbeddedEntityDropdownButton");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
const EmbedEntityWidget = ({ isDisabled, canInsertBlocks })=>{
    const sdk = (0, _SdkProvider.useSdkContext)();
    const editor = (0, _ContentfulEditorProvider.useContentfulEditor)();
    const [isEmbedDropdownOpen, setEmbedDropdownOpen] = (0, _react.useState)(false);
    const onCloseEntityDropdown = ()=>setEmbedDropdownOpen(false);
    const onToggleEntityDropdown = ()=>setEmbedDropdownOpen(!isEmbedDropdownOpen);
    const inlineEntryEmbedEnabled = (0, _validations.isNodeTypeEnabled)(sdk.field, _richtexttypes.INLINES.EMBEDDED_ENTRY);
    const inlineResourceEmbedEnabled = (0, _validations.isNodeTypeEnabled)(sdk.field, _richtexttypes.INLINES.EMBEDDED_RESOURCE);
    const blockEntryEmbedEnabled = (0, _validations.isNodeTypeEnabled)(sdk.field, _richtexttypes.BLOCKS.EMBEDDED_ENTRY) && canInsertBlocks;
    const blockResourceEmbedEnabled = (0, _validations.isNodeTypeEnabled)(sdk.field, _richtexttypes.BLOCKS.EMBEDDED_RESOURCE) && canInsertBlocks;
    const blockAssetEmbedEnabled = (0, _validations.isNodeTypeEnabled)(sdk.field, _richtexttypes.BLOCKS.EMBEDDED_ASSET) && canInsertBlocks;
    const actions = /*#__PURE__*/ _react.default.createElement(_react.default.Fragment, null, blockEntryEmbedEnabled && /*#__PURE__*/ _react.default.createElement(_EmbeddedBlockToolbarIcon.EmbeddedBlockToolbarIcon, {
        isDisabled: !!isDisabled,
        nodeType: _richtexttypes.BLOCKS.EMBEDDED_ENTRY,
        onClose: onCloseEntityDropdown
    }), blockResourceEmbedEnabled && /*#__PURE__*/ _react.default.createElement(_EmbeddedBlockToolbarIcon.EmbeddedBlockToolbarIcon, {
        isDisabled: !!isDisabled,
        nodeType: _richtexttypes.BLOCKS.EMBEDDED_RESOURCE,
        onClose: onCloseEntityDropdown
    }), inlineEntryEmbedEnabled && /*#__PURE__*/ _react.default.createElement(_EmbeddedInlineToolbarIcon.EmbeddedInlineToolbarIcon, {
        nodeType: _richtexttypes.INLINES.EMBEDDED_ENTRY,
        isDisabled: !!isDisabled || (0, _editor.isLinkActive)(editor),
        onClose: onCloseEntityDropdown
    }), inlineResourceEmbedEnabled && /*#__PURE__*/ _react.default.createElement(_EmbeddedInlineToolbarIcon.EmbeddedInlineToolbarIcon, {
        nodeType: _richtexttypes.INLINES.EMBEDDED_RESOURCE,
        isDisabled: !!isDisabled || (0, _editor.isLinkActive)(editor),
        onClose: onCloseEntityDropdown
    }), blockAssetEmbedEnabled && /*#__PURE__*/ _react.default.createElement(_EmbeddedBlockToolbarIcon.EmbeddedBlockToolbarIcon, {
        isDisabled: !!isDisabled,
        nodeType: _richtexttypes.BLOCKS.EMBEDDED_ASSET,
        onClose: onCloseEntityDropdown
    }));
    const showEmbedButton = blockEntryEmbedEnabled || blockResourceEmbedEnabled || inlineEntryEmbedEnabled || inlineResourceEmbedEnabled || blockAssetEmbedEnabled;
    return showEmbedButton ? /*#__PURE__*/ _react.default.createElement(_EmbeddedEntityDropdownButton.EmbeddedEntityDropdownButton, {
        isDisabled: isDisabled,
        onClose: onCloseEntityDropdown,
        onToggle: onToggleEntityDropdown,
        isOpen: isEmbedDropdownOpen
    }, actions) : null;
};
