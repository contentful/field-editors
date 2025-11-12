"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FetchingWrappedResourceCard", {
    enumerable: true,
    get: function() {
        return FetchingWrappedResourceCard;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _f36components = require("@contentful/f36-components");
const _fieldeditorreference = require("@contentful/field-editor-reference");
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
const InternalEntryCard = /*#__PURE__*/ _react.memo((props)=>{
    if (props.data === undefined || props.status === 'loading') {
        return /*#__PURE__*/ _react.createElement(_f36components.EntryCard, {
            isLoading: true
        });
    }
    const { contentType, resource: entry, space } = props.data;
    return /*#__PURE__*/ _react.createElement(_fieldeditorreference.WrappedEntryCard, {
        size: "default",
        getAsset: ()=>Promise.resolve(),
        isSelected: props.isSelected,
        isDisabled: props.isDisabled,
        localeCode: props.data.defaultLocaleCode,
        defaultLocaleCode: props.data.defaultLocaleCode,
        contentType: contentType,
        spaceName: space?.name,
        entry: entry,
        onEdit: props.onEdit,
        onRemove: props.isDisabled ? undefined : props.onRemove,
        isClickable: false,
        getEntityScheduledActions: ()=>Promise.resolve([]),
        useLocalizedEntityStatus: props.sdk.parameters.instance.useLocalizedEntityStatus,
        renderDragHandle: !props.isDisabled ? (dragHandleProps)=>/*#__PURE__*/ _react.createElement(_f36components.DragHandle, {
                label: "drag resource entry",
                ...dragHandleProps
            }) : undefined
    });
}, _fastdeepequal.default);
InternalEntryCard.displayName = 'ReferenceCard';
const FetchingWrappedResourceCard = (props)=>{
    const { link, onEntityFetchComplete, sdk } = props;
    const { data, status, error } = (0, _fieldeditorreference.useResource)(link.linkType, link.urn, {
        locale: sdk.field.locale
    });
    _react.useEffect(()=>{
        if (status === 'success') {
            onEntityFetchComplete?.();
        }
    }, [
        onEntityFetchComplete,
        status
    ]);
    if (status === 'error') {
        return /*#__PURE__*/ _react.createElement(_fieldeditorreference.ResourceEntityErrorCard, {
            error: error,
            linkType: link.linkType,
            isSelected: props.isSelected,
            isDisabled: props.isDisabled,
            onRemove: props.onRemove
        });
    }
    return /*#__PURE__*/ _react.createElement(InternalEntryCard, {
        data: data,
        status: status,
        sdk: props.sdk,
        isDisabled: props.isDisabled,
        isSelected: props.isSelected,
        onEdit: props.onEdit,
        onRemove: props.onRemove
    });
};
