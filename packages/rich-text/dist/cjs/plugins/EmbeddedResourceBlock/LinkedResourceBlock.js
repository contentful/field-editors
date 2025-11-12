"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LinkedResourceBlock", {
    enumerable: true,
    get: function() {
        return LinkedResourceBlock;
    }
});
const _react = /*#__PURE__*/ _interop_require_default(require("react"));
const _slatereact = require("slate-react");
const _ContentfulEditorProvider = require("../../ContentfulEditorProvider");
const _internal = require("../../internal");
const _SdkProvider = require("../../SdkProvider");
const _linkstracking = require("../links-tracking");
const _FetchingWrappedResourceCard = require("../shared/FetchingWrappedResourceCard");
const _LinkedBlockWrapper = require("../shared/LinkedBlockWrapper");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function LinkedResourceBlock(props) {
    const { attributes, children, element } = props;
    const { onEntityFetchComplete } = (0, _linkstracking.useLinkTracking)();
    const isSelected = (0, _slatereact.useSelected)();
    const editor = (0, _ContentfulEditorProvider.useContentfulEditor)();
    const sdk = (0, _SdkProvider.useSdkContext)();
    const isDisabled = (0, _slatereact.useReadOnly)();
    const link = element.data.target.sys;
    const handleRemoveClick = _react.default.useCallback(()=>{
        if (!editor) return;
        const pathToElement = (0, _internal.findNodePath)(editor, element);
        (0, _internal.removeNodes)(editor, {
            at: pathToElement
        });
    }, [
        editor,
        element
    ]);
    return /*#__PURE__*/ _react.default.createElement(_LinkedBlockWrapper.LinkedBlockWrapper, {
        attributes: attributes,
        link: element.data.target,
        card: /*#__PURE__*/ _react.default.createElement(_FetchingWrappedResourceCard.FetchingWrappedResourceCard, {
            sdk: sdk,
            link: link,
            isDisabled: isDisabled,
            isSelected: isSelected,
            onRemove: handleRemoveClick,
            onEntityFetchComplete: onEntityFetchComplete
        })
    }, children);
}
