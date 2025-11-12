"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LinkedInlineWrapper", {
    enumerable: true,
    get: function() {
        return LinkedInlineWrapper;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _f36tokens = /*#__PURE__*/ _interop_require_default(require("@contentful/f36-tokens"));
const _emotion = require("emotion");
const _environment = require("../../helpers/environment");
const _utils = require("./utils");
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
function LinkedInlineWrapper({ attributes, card, children, link }) {
    return /*#__PURE__*/ _react.createElement("span", {
        ...attributes,
        className: styles.root,
        "data-entity-type": link.sys.linkType,
        "data-entity-id": (0, _utils.getLinkEntityId)(link),
        contentEditable: _environment.IS_CHROME ? undefined : false,
        draggable: _environment.IS_CHROME ? true : undefined
    }, /*#__PURE__*/ _react.createElement("span", {
        contentEditable: _environment.IS_CHROME ? false : undefined,
        draggable: _environment.IS_CHROME ? true : undefined
    }, card), children);
}
