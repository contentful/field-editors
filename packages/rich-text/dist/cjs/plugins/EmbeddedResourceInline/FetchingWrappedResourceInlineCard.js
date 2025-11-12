"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FetchingWrappedResourceInlineCard", {
    enumerable: true,
    get: function() {
        return FetchingWrappedResourceInlineCard;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _f36components = require("@contentful/f36-components");
const _fieldeditorreference = require("@contentful/field-editor-reference");
const _fieldeditorshared = require("@contentful/field-editor-shared");
const _richtexttypes = require("@contentful/rich-text-types");
const _utils = require("../../plugins/shared/utils");
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
const { getEntryTitle, getEntityStatus } = _fieldeditorshared.entityHelpers;
function FetchingWrappedResourceInlineCard(props) {
    const { link, onEntityFetchComplete, sdk } = props;
    const { data, status: requestStatus } = (0, _fieldeditorreference.useResource)(link.linkType, link.urn, {
        locale: sdk.field.locale
    });
    _react.useEffect(()=>{
        if (requestStatus === 'success') {
            onEntityFetchComplete?.();
        }
    }, [
        onEntityFetchComplete,
        requestStatus
    ]);
    if (requestStatus === 'error') {
        return /*#__PURE__*/ _react.createElement(_f36components.InlineEntryCard, {
            title: "Content missing or inaccessible",
            testId: _richtexttypes.INLINES.EMBEDDED_RESOURCE,
            isSelected: props.isSelected
        });
    }
    if (requestStatus === 'loading' || data === undefined) {
        return /*#__PURE__*/ _react.createElement(_f36components.InlineEntryCard, {
            isLoading: true
        });
    }
    const { resource: entry, contentType, defaultLocaleCode, space } = data;
    const title = getEntryTitle({
        entry,
        contentType,
        defaultLocaleCode,
        localeCode: defaultLocaleCode,
        defaultTitle: 'Untitled'
    });
    const truncatedTitle = (0, _utils.truncateTitle)(title, 40);
    const status = getEntityStatus(entry.sys, props.sdk.parameters.instance.useLocalizedEntityStatus ? props.sdk.field.locale : undefined);
    return /*#__PURE__*/ _react.createElement(_f36components.InlineEntryCard, {
        testId: _richtexttypes.INLINES.EMBEDDED_RESOURCE,
        isSelected: props.isSelected,
        title: `${contentType.name}: ${truncatedTitle} (Space: ${space.name} – Env.: ${entry.sys.environment.sys.id})`,
        status: status,
        actions: [
            /*#__PURE__*/ _react.createElement(_f36components.MenuItem, {
                key: "remove",
                onClick: props.onRemove,
                disabled: props.isDisabled,
                testId: "delete"
            }, "Remove")
        ]
    }, /*#__PURE__*/ _react.createElement(_f36components.Text, null, title));
}
