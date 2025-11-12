"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LinkedEntityInline", {
    enumerable: true,
    get: function() {
        return LinkedEntityInline;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _slatereact = require("slate-react");
const _ContentfulEditorProvider = require("../../ContentfulEditorProvider");
const _editor = require("../../helpers/editor");
const _queries = require("../../internal/queries");
const _transforms = require("../../internal/transforms");
const _SdkProvider = require("../../SdkProvider");
const _linkstracking = require("../links-tracking");
const _LinkedInlineWrapper = require("../shared/LinkedInlineWrapper");
const _FetchingWrappedInlineEntryCard = require("./FetchingWrappedInlineEntryCard");
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
function LinkedEntityInline(props) {
    const { attributes, children, element } = props;
    const { onEntityFetchComplete } = (0, _linkstracking.useLinkTracking)();
    const isSelected = (0, _slatereact.useSelected)();
    const editor = (0, _ContentfulEditorProvider.useContentfulEditor)();
    const sdk = (0, _SdkProvider.useSdkContext)();
    const isDisabled = (0, _slatereact.useReadOnly)();
    const { id: entryId } = element.data.target.sys;
    function handleEditClick() {
        return sdk.navigator.openEntry(entryId, {
            slideIn: {
                waitForClose: true
            }
        }).then(()=>{
            editor && (0, _editor.focus)(editor);
        });
    }
    function handleRemoveClick() {
        if (!editor) return;
        const pathToElement = (0, _queries.findNodePath)(editor, element);
        (0, _transforms.removeNodes)(editor, {
            at: pathToElement
        });
    }
    return /*#__PURE__*/ _react.createElement(_LinkedInlineWrapper.LinkedInlineWrapper, {
        attributes: attributes,
        card: /*#__PURE__*/ _react.createElement(_FetchingWrappedInlineEntryCard.FetchingWrappedInlineEntryCard, {
            sdk: sdk,
            entryId: entryId,
            isSelected: isSelected,
            isDisabled: isDisabled,
            onRemove: handleRemoveClick,
            onEdit: handleEditClick,
            onEntityFetchComplete: onEntityFetchComplete
        }),
        link: element.data.target
    }, children);
}
