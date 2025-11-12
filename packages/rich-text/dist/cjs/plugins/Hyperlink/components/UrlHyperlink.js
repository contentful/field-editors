"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UrlHyperlink", {
    enumerable: true,
    get: function() {
        return UrlHyperlink;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _f36components = require("@contentful/f36-components");
const _linkHandlers = require("./linkHandlers");
const _LinkPopover = require("./LinkPopover");
const _styles = require("./styles");
const _useHyperlinkCommon = require("./useHyperlinkCommon");
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
function UrlHyperlink(props) {
    const { editor, sdk, isLinkFocused, pathToElement, isEditorFocused } = (0, _useHyperlinkCommon.useHyperlinkCommon)(props.element);
    const uri = props.element.data?.uri;
    const popoverText = /*#__PURE__*/ _react.createElement(_f36components.TextLink, {
        className: _styles.styles.openLink,
        href: uri,
        rel: "noopener noreferrer",
        target: "_blank"
    }, uri);
    return /*#__PURE__*/ _react.createElement(_LinkPopover.LinkPopover, {
        isLinkFocused: isLinkFocused,
        handleEditLink: ()=>(0, _linkHandlers.handleEditLink)(editor, sdk, pathToElement),
        handleRemoveLink: ()=>(0, _linkHandlers.handleRemoveLink)(editor),
        handleCopyLink: ()=>(0, _linkHandlers.handleCopyLink)(uri),
        popoverText: popoverText,
        isEditorFocused: isEditorFocused
    }, /*#__PURE__*/ _react.createElement(_f36components.TextLink, {
        testId: "cf-ui-text-link",
        href: uri,
        onClick: (e)=>e.preventDefault(),
        className: _styles.styles.hyperlink
    }, props.children));
}
