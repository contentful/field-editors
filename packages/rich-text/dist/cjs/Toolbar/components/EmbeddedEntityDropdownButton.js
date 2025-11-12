"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EmbeddedEntityDropdownButton", {
    enumerable: true,
    get: function() {
        return EmbeddedEntityDropdownButton;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _f36components = require("@contentful/f36-components");
const _f36icons = require("@contentful/f36-icons");
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
function EmbeddedEntityDropdownButton({ children, isDisabled, isOpen, onClose, onToggle }) {
    return /*#__PURE__*/ _react.createElement(_f36components.Menu, {
        placement: "bottom-end",
        isOpen: isOpen,
        onClose: onClose,
        onOpen: onToggle
    }, /*#__PURE__*/ _react.createElement(_f36components.Menu.Trigger, null, /*#__PURE__*/ _react.createElement(_f36components.Button, {
        endIcon: /*#__PURE__*/ _react.createElement(_f36icons.CaretDownIcon, null),
        testId: "toolbar-entity-dropdown-toggle",
        variant: "secondary",
        size: "small",
        startIcon: /*#__PURE__*/ _react.createElement(_f36icons.PlusIcon, null),
        isDisabled: isDisabled
    }, "Embed")), /*#__PURE__*/ _react.createElement(_f36components.Menu.List, {
        className: "toolbar-entity-dropdown-list"
    }, children));
}
