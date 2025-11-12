"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FetchingWrappedInlineEntryCard", {
    enumerable: true,
    get: function() {
        return FetchingWrappedInlineEntryCard;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _f36components = require("@contentful/f36-components");
const _f36icons = require("@contentful/f36-icons");
const _f36tokens = /*#__PURE__*/ _interop_require_default(require("@contentful/f36-tokens"));
const _fieldeditorreference = require("@contentful/field-editor-reference");
const _fieldeditorshared = require("@contentful/field-editor-shared");
const _richtexttypes = require("@contentful/rich-text-types");
const _emotion = require("emotion");
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
const { getEntryTitle, getEntityStatus } = _fieldeditorshared.entityHelpers;
const styles = {
    scheduledIcon: (0, _emotion.css)({
        verticalAlign: 'text-bottom',
        marginRight: _f36tokens.default.spacing2Xs
    })
};
function InternalFetchingWrappedInlineEntryCard({ entry, allContentTypes, locale, defaultLocale, isSelected, entryStatus, getEntityScheduledActions, onEdit, onRemove, isDisabled }) {
    const contentType = _react.useMemo(()=>{
        if (!allContentTypes) {
            return undefined;
        }
        return allContentTypes.find((contentType)=>contentType.sys.id === entry.sys.contentType.sys.id);
    }, [
        allContentTypes,
        entry
    ]);
    const title = _react.useMemo(()=>getEntryTitle({
            entry,
            contentType,
            localeCode: locale,
            defaultLocaleCode: defaultLocale,
            defaultTitle: 'Untitled'
        }), [
        entry,
        contentType,
        locale,
        defaultLocale
    ]);
    return /*#__PURE__*/ _react.createElement(_f36components.InlineEntryCard, {
        testId: _richtexttypes.INLINES.EMBEDDED_ENTRY,
        isSelected: isSelected,
        title: contentType ? `${contentType.name}: ${title}` : title,
        status: entryStatus,
        actions: [
            /*#__PURE__*/ _react.createElement(_f36components.MenuItem, {
                key: "edit",
                onClick: onEdit
            }, "Edit"),
            /*#__PURE__*/ _react.createElement(_f36components.MenuItem, {
                key: "remove",
                onClick: onRemove,
                disabled: isDisabled,
                testId: "delete"
            }, "Remove")
        ]
    }, /*#__PURE__*/ _react.createElement(_fieldeditorreference.ScheduledIconWithTooltip, {
        getEntityScheduledActions: getEntityScheduledActions,
        entityType: "Entry",
        entityId: entry.sys.id
    }, /*#__PURE__*/ _react.createElement(_f36icons.ClockIcon, {
        className: styles.scheduledIcon,
        color: _f36tokens.default.gray600,
        testId: "scheduled-icon"
    })), /*#__PURE__*/ _react.createElement(_f36components.Text, null, title));
}
function FetchingWrappedInlineEntryCard(props) {
    const { data: entry, status: requestStatus } = (0, _fieldeditorreference.useEntity)('Entry', props.entryId);
    const { getEntityScheduledActions } = (0, _fieldeditorreference.useEntityLoader)();
    const { onEntityFetchComplete } = props;
    _react.useEffect(()=>{
        if (requestStatus !== 'success') {
            return;
        }
        onEntityFetchComplete?.();
    }, [
        requestStatus,
        onEntityFetchComplete
    ]);
    if (requestStatus === 'loading' || requestStatus === 'idle') {
        return /*#__PURE__*/ _react.createElement(_f36components.InlineEntryCard, {
            isLoading: true
        });
    }
    if (requestStatus === 'error') {
        return /*#__PURE__*/ _react.createElement(_f36components.InlineEntryCard, {
            title: "Content missing or inaccessible",
            testId: _richtexttypes.INLINES.EMBEDDED_ENTRY,
            isSelected: props.isSelected
        });
    }
    const entryStatus = getEntityStatus(entry.sys, props.sdk.parameters.instance.useLocalizedEntityStatus ? props.sdk.field.locale : undefined);
    if (entryStatus === 'deleted') {
        return /*#__PURE__*/ _react.createElement(_f36components.InlineEntryCard, {
            title: "Content missing or inaccessible",
            testId: _richtexttypes.INLINES.EMBEDDED_ENTRY,
            isSelected: props.isSelected,
            actions: [
                /*#__PURE__*/ _react.createElement(_f36components.MenuItem, {
                    key: "remove",
                    onClick: props.onRemove,
                    testId: "delete"
                }, "Remove")
            ]
        });
    }
    return /*#__PURE__*/ _react.createElement(InternalFetchingWrappedInlineEntryCard, {
        allContentTypes: props.sdk.space.getCachedContentTypes(),
        getEntityScheduledActions: ()=>getEntityScheduledActions('Entry', props.entryId),
        locale: props.sdk.field.locale,
        defaultLocale: props.sdk.locales.default,
        entry: entry,
        entryStatus: entryStatus,
        isDisabled: props.isDisabled,
        isSelected: props.isSelected,
        onEdit: props.onEdit,
        onRemove: props.onRemove
    });
}
