"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EntityHyperlink", {
    enumerable: true,
    get: function() {
        return EntityHyperlink;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _f36components = require("@contentful/f36-components");
const _linkstracking = require("../../links-tracking");
const _useEntityInfo = require("../useEntityInfo");
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
function EntityHyperlink(props) {
    const { editor, sdk, isLinkFocused, pathToElement, isEditorFocused } = (0, _useHyperlinkCommon.useHyperlinkCommon)(props.element);
    const { onEntityFetchComplete } = (0, _linkstracking.useLinkTracking)();
    const { target } = props.element.data;
    const tooltipContent = (0, _useEntityInfo.useEntityInfo)({
        target,
        sdk,
        onEntityFetchComplete
    });
    if (!target) {
        return null;
    }
    const popoverText = /*#__PURE__*/ _react.createElement(_f36components.Text, {
        fontColor: "blue600",
        fontWeight: "fontWeightMedium",
        className: _styles.styles.openLink
    }, tooltipContent);
    return /*#__PURE__*/ _react.createElement(_LinkPopover.LinkPopover, {
        isLinkFocused: isLinkFocused,
        handleEditLink: ()=>(0, _linkHandlers.handleEditLink)(editor, sdk, pathToElement),
        handleRemoveLink: ()=>(0, _linkHandlers.handleRemoveLink)(editor),
        popoverText: popoverText,
        isEditorFocused: isEditorFocused
    }, /*#__PURE__*/ _react.createElement(_f36components.Text, {
        testId: "cf-ui-text-link",
        fontColor: "blue600",
        fontWeight: "fontWeightMedium",
        className: _styles.styles.hyperlink,
        "data-link-type": target.sys.linkType,
        "data-link-id": target.sys.id
    }, props.children));
}
