"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FetchingWrappedAssetCard", {
    enumerable: true,
    get: function() {
        return FetchingWrappedAssetCard;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _f36components = require("@contentful/f36-components");
const _fieldeditorreference = require("@contentful/field-editor-reference");
const _fieldeditorshared = require("@contentful/field-editor-shared");
const _fastdeepequal = /*#__PURE__*/ _interop_require_default(require("fast-deep-equal"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
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
const InternalAssetCard = /*#__PURE__*/ _react.memo(({ asset, sdk, isDisabled, isSelected, locale, onEdit, onRemove, loadEntityScheduledActions, localesStatusMap, release, releaseStatusMap, releaseEntityStatus })=>{
    const activeLocales = (0, _fieldeditorshared.useActiveLocales)(sdk);
    return /*#__PURE__*/ _react.createElement(_fieldeditorreference.WrappedAssetCard, {
        getEntityScheduledActions: loadEntityScheduledActions,
        size: "small",
        isSelected: isSelected,
        isDisabled: isDisabled,
        localeCode: locale,
        defaultLocaleCode: sdk.locales.default,
        asset: asset,
        onEdit: onEdit,
        onRemove: isDisabled ? undefined : onRemove,
        isClickable: false,
        useLocalizedEntityStatus: sdk.parameters.instance.useLocalizedEntityStatus,
        localesStatusMap: localesStatusMap,
        activeLocales: activeLocales,
        renderDragHandle: !isDisabled ? (dragHandleProps)=>/*#__PURE__*/ _react.createElement(_f36components.DragHandle, {
                label: "drag embedded asset",
                ...dragHandleProps
            }) : undefined,
        releaseStatusMap: releaseStatusMap,
        release: release,
        releaseEntityStatus: releaseEntityStatus
    });
}, _fastdeepequal.default);
InternalAssetCard.displayName = 'InternalAssetCard';
function FetchingWrappedAssetCard(props) {
    const { onEntityFetchComplete } = props;
    const { data: asset, status, currentEntity } = (0, _fieldeditorreference.useEntity)('Asset', props.assetId);
    const { getEntityScheduledActions } = (0, _fieldeditorreference.useEntityLoader)();
    const loadEntityScheduledActions = _react.useCallback(()=>getEntityScheduledActions('Asset', props.assetId), [
        getEntityScheduledActions,
        props.assetId
    ]);
    const localesStatusMap = (0, _fieldeditorshared.useLocalePublishStatus)(asset, props.sdk.locales);
    const { releaseStatusMap, releaseEntityStatus } = (0, _fieldeditorshared.useReleaseStatus)({
        entity: asset,
        previousEntityOnTimeline: currentEntity,
        locales: props.sdk.locales,
        release: props.sdk.release,
        isReference: true
    });
    _react.useEffect(()=>{
        if (status === 'success') {
            onEntityFetchComplete?.();
        }
    }, [
        onEntityFetchComplete,
        status
    ]);
    if (status === 'loading' || status === 'idle') {
        return /*#__PURE__*/ _react.createElement(_f36components.AssetCard, {
            size: "default",
            isLoading: true
        });
    }
    if (status === 'error') {
        return /*#__PURE__*/ _react.createElement(_fieldeditorreference.MissingEntityCard, {
            isDisabled: props.isDisabled,
            onRemove: props.onRemove,
            providerName: "Contentful"
        });
    }
    return /*#__PURE__*/ _react.createElement(InternalAssetCard, {
        asset: asset,
        sdk: props.sdk,
        isDisabled: props.isDisabled,
        isSelected: props.isSelected,
        loadEntityScheduledActions: loadEntityScheduledActions,
        locale: props.locale,
        onEdit: props.onEdit,
        onRemove: props.onRemove,
        localesStatusMap: localesStatusMap,
        releaseStatusMap: releaseStatusMap,
        release: props.sdk.release,
        releaseEntityStatus: releaseEntityStatus
    });
}
