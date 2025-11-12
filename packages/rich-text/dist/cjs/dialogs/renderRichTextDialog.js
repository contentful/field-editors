"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "renderRichTextDialog", {
    enumerable: true,
    get: function() {
        return renderRichTextDialog;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _HyperlinkDialog = require("./HypelinkDialog/HyperlinkDialog");
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
const renderRichTextDialog = (sdk)=>{
    const parameters = sdk.parameters.invocation;
    if (parameters?.type === 'rich-text-hyperlink-dialog') {
        sdk.window.startAutoResizer();
        return /*#__PURE__*/ _react.createElement(_HyperlinkDialog.HyperlinkDialog, {
            ...parameters,
            onClose: sdk.close,
            sdk: sdk
        });
    }
    return /*#__PURE__*/ _react.createElement("div", null);
};
