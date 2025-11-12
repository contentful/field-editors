"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ToolbarButton", {
    enumerable: true,
    get: function() {
        return ToolbarButton;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _f36components = require("@contentful/f36-components");
const _f36tokens = /*#__PURE__*/ _interop_require_default(require("@contentful/f36-tokens"));
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
const styles = {
    button: (0, _emotion.css)({
        height: '30px',
        width: '30px',
        marginLeft: _f36tokens.default.spacing2Xs,
        marginRight: _f36tokens.default.spacing2Xs
    }),
    tooltip: (0, _emotion.css)({
        zIndex: Number(_f36tokens.default.zIndexTooltip)
    })
};
function ToolbarButton(props) {
    const { title, testId, isActive, children, className, isDisabled = false } = props;
    const handleClick = (event)=>{
        event.preventDefault();
        props.onClick();
    };
    const button = /*#__PURE__*/ _react.createElement(_f36components.Button, {
        className: (0, _emotion.cx)(styles.button, className),
        isDisabled: isDisabled,
        startIcon: children,
        onClick: handleClick,
        testId: testId,
        variant: isActive ? 'secondary' : 'transparent',
        size: "small"
    });
    if (title) {
        return /*#__PURE__*/ _react.createElement(_f36components.Tooltip, {
            className: styles.tooltip,
            placement: "bottom",
            content: title
        }, button);
    }
    return button;
}
