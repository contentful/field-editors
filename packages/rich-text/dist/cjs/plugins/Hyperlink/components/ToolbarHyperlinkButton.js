"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ToolbarHyperlinkButton", {
    enumerable: true,
    get: function() {
        return ToolbarHyperlinkButton;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _f36icons = require("@contentful/f36-icons");
const _ContentfulEditorProvider = require("../../../ContentfulEditorProvider");
const _editor = require("../../../helpers/editor");
const _SdkProvider = require("../../../SdkProvider");
const _ToolbarButton = require("../../shared/ToolbarButton");
const _HyperlinkModal = require("../HyperlinkModal");
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
function ToolbarHyperlinkButton(props) {
    const editor = (0, _ContentfulEditorProvider.useContentfulEditor)();
    const isActive = !!(editor && (0, _editor.isLinkActive)(editor));
    const sdk = (0, _SdkProvider.useSdkContext)();
    async function handleClick() {
        if (!editor) return;
        if (isActive) {
            (0, _editor.unwrapLink)(editor);
            editor.tracking.onToolbarAction('unlinkHyperlinks');
        } else {
            (0, _HyperlinkModal.addOrEditLink)(editor, sdk, editor.tracking.onToolbarAction);
        }
    }
    if (!editor) return null;
    return /*#__PURE__*/ _react.createElement(_ToolbarButton.ToolbarButton, {
        title: "Hyperlink",
        testId: "hyperlink-toolbar-button",
        onClick: handleClick,
        isActive: isActive,
        isDisabled: props.isDisabled
    }, /*#__PURE__*/ _react.createElement(_f36icons.LinkSimpleIcon, null));
}
