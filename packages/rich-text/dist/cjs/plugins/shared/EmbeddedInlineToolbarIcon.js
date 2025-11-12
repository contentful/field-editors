"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EmbeddedInlineToolbarIcon", {
    enumerable: true,
    get: function() {
        return EmbeddedInlineToolbarIcon;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _f36components = require("@contentful/f36-components");
const _f36icons = require("@contentful/f36-icons");
const _f36tokens = /*#__PURE__*/ _interop_require_default(require("@contentful/f36-tokens"));
const _richtexttypes = require("@contentful/rich-text-types");
const _emotion = require("emotion");
const _ContentfulEditorProvider = require("../../ContentfulEditorProvider");
const _editor = require("../../helpers/editor");
const _SdkProvider = require("../../SdkProvider");
const _EmbeddedInlineUtil = require("../shared/EmbeddedInlineUtil");
const _ResourceNewBadge = require("./ResourceNewBadge");
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
const styles = {
    icon: (0, _emotion.css)({
        marginRight: '10px'
    }),
    root: (0, _emotion.css)({
        display: 'inline-block',
        margin: `0 ${_f36tokens.default.spacing2Xs}`,
        fontSize: 'inherit',
        span: {
            userSelect: 'none'
        }
    })
};
function EmbeddedInlineToolbarIcon({ onClose, nodeType, isDisabled }) {
    const editor = (0, _ContentfulEditorProvider.useContentfulEditor)();
    const sdk = (0, _SdkProvider.useSdkContext)();
    async function handleClick(event) {
        event.preventDefault();
        if (!editor) return;
        onClose();
        if (nodeType === _richtexttypes.INLINES.EMBEDDED_RESOURCE) {
            await (0, _EmbeddedInlineUtil.selectResourceEntityAndInsert)(editor, sdk, editor.tracking.onToolbarAction);
        } else {
            await (0, _EmbeddedInlineUtil.selectEntityAndInsert)(editor, sdk, editor.tracking.onToolbarAction);
        }
        (0, _editor.moveToTheNextChar)(editor);
    }
    return /*#__PURE__*/ _react.createElement(_f36components.Menu.Item, {
        disabled: isDisabled,
        className: "rich-text__entry-link-block-button",
        testId: `toolbar-toggle-${nodeType}`,
        onClick: handleClick
    }, /*#__PURE__*/ _react.createElement(_f36components.Flex, {
        alignItems: "center",
        flexDirection: "row"
    }, /*#__PURE__*/ _react.createElement(_f36icons.EmbeddedLineIcon, {
        color: _f36tokens.default.gray900,
        className: `rich-text__embedded-entry-list-icon ${styles.icon}`
    }), /*#__PURE__*/ _react.createElement("span", null, "Inline entry", nodeType == _richtexttypes.INLINES.EMBEDDED_RESOURCE && /*#__PURE__*/ _react.createElement(_ResourceNewBadge.ResourceNewBadge, null))));
}
