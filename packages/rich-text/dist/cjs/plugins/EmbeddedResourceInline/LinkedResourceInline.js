"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LinkedResourceInline", {
    enumerable: true,
    get: function() {
        return LinkedResourceInline;
    }
});
const _react = /*#__PURE__*/ _interop_require_default(require("react"));
const _slatereact = require("slate-react");
const _ContentfulEditorProvider = require("../../ContentfulEditorProvider");
const _internal = require("../../internal");
const _SdkProvider = require("../../SdkProvider");
const _linkstracking = require("../links-tracking");
const _LinkedInlineWrapper = require("../shared/LinkedInlineWrapper");
const _FetchingWrappedResourceInlineCard = require("./FetchingWrappedResourceInlineCard");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function LinkedResourceInline(props) {
    const { attributes, children, element } = props;
    const { onEntityFetchComplete } = (0, _linkstracking.useLinkTracking)();
    const isSelected = (0, _slatereact.useSelected)();
    const editor = (0, _ContentfulEditorProvider.useContentfulEditor)();
    const sdk = (0, _SdkProvider.useSdkContext)();
    const isDisabled = (0, _slatereact.useReadOnly)();
    const link = element.data.target.sys;
    function handleRemoveClick() {
        if (!editor) return;
        const pathToElement = (0, _internal.findNodePath)(editor, element);
        (0, _internal.removeNodes)(editor, {
            at: pathToElement
        });
    }
    return /*#__PURE__*/ _react.default.createElement(_LinkedInlineWrapper.LinkedInlineWrapper, {
        attributes: attributes,
        link: element.data.target,
        card: /*#__PURE__*/ _react.default.createElement(_FetchingWrappedResourceInlineCard.FetchingWrappedResourceInlineCard, {
            sdk: sdk,
            link: link,
            isDisabled: isDisabled,
            isSelected: isSelected,
            onRemove: handleRemoveClick,
            onEntityFetchComplete: onEntityFetchComplete
        })
    }, children);
}
