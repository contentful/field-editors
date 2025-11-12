"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LinkedEntityBlock", {
    enumerable: true,
    get: function() {
        return LinkedEntityBlock;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _slatereact = require("slate-react");
const _ContentfulEditorProvider = require("../../ContentfulEditorProvider");
const _queries = require("../../internal/queries");
const _transforms = require("../../internal/transforms");
const _SdkProvider = require("../../SdkProvider");
const _linkstracking = require("../links-tracking");
const _FetchingWrappedAssetCard = require("../shared/FetchingWrappedAssetCard");
const _FetchingWrappedEntryCard = require("../shared/FetchingWrappedEntryCard");
const _LinkedBlockWrapper = require("../shared/LinkedBlockWrapper");
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
function LinkedEntityBlock(props) {
    const { attributes, children, element } = props;
    const { onEntityFetchComplete } = (0, _linkstracking.useLinkTracking)();
    const isSelected = (0, _slatereact.useSelected)();
    const editor = (0, _ContentfulEditorProvider.useContentfulEditor)();
    const sdk = (0, _SdkProvider.useSdkContext)();
    const isDisabled = (0, _slatereact.useReadOnly)();
    const { id: entityId, linkType: entityType } = element.data.target.sys;
    const handleEditClick = _react.useCallback(()=>{
        const openEntity = entityType === 'Asset' ? sdk.navigator.openAsset : sdk.navigator.openEntry;
        return openEntity(entityId, {
            slideIn: true
        });
    }, [
        sdk,
        entityId,
        entityType
    ]);
    const handleRemoveClick = _react.useCallback(()=>{
        if (!editor) return;
        const pathToElement = (0, _queries.findNodePath)(editor, element);
        (0, _transforms.removeNodes)(editor, {
            at: pathToElement
        });
    }, [
        editor,
        element
    ]);
    return /*#__PURE__*/ _react.createElement(_LinkedBlockWrapper.LinkedBlockWrapper, {
        attributes: attributes,
        card: /*#__PURE__*/ _react.createElement(_react.Fragment, null, entityType === 'Entry' && /*#__PURE__*/ _react.createElement(_FetchingWrappedEntryCard.FetchingWrappedEntryCard, {
            sdk: sdk,
            entryId: entityId,
            locale: sdk.field.locale,
            isDisabled: isDisabled,
            isSelected: isSelected,
            onRemove: handleRemoveClick,
            onEdit: handleEditClick,
            onEntityFetchComplete: onEntityFetchComplete
        }), entityType === 'Asset' && /*#__PURE__*/ _react.createElement(_FetchingWrappedAssetCard.FetchingWrappedAssetCard, {
            sdk: sdk,
            assetId: entityId,
            locale: sdk.field.locale,
            isDisabled: isDisabled,
            isSelected: isSelected,
            onRemove: handleRemoveClick,
            onEdit: handleEditClick,
            onEntityFetchComplete: onEntityFetchComplete
        })),
        link: element.data.target
    }, children);
}
