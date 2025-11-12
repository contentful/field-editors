"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "HeadingComponents", {
    enumerable: true,
    get: function() {
        return HeadingComponents;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(require("react"));
const _f36tokens = /*#__PURE__*/ _interop_require_default(require("@contentful/f36-tokens"));
const _richtexttypes = require("@contentful/rich-text-types");
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
    dropdown: {
        root: (0, _emotion.css)`
      font-weight: ${_f36tokens.default.fontWeightDemiBold};
    `,
        [_richtexttypes.BLOCKS.PARAGRAPH]: (0, _emotion.css)`
      font-size: ${_f36tokens.default.fontSizeL};
    `,
        [_richtexttypes.BLOCKS.HEADING_1]: (0, _emotion.css)`
      font-size: 1.625rem;
    `,
        [_richtexttypes.BLOCKS.HEADING_2]: (0, _emotion.css)`
      font-size: 1.4375rem;
    `,
        [_richtexttypes.BLOCKS.HEADING_3]: (0, _emotion.css)`
      font-size: 1.25rem;
    `,
        [_richtexttypes.BLOCKS.HEADING_4]: (0, _emotion.css)`
      font-size: 1.125rem;
    `,
        [_richtexttypes.BLOCKS.HEADING_5]: (0, _emotion.css)`
      font-size: 1rem;
    `,
        [_richtexttypes.BLOCKS.HEADING_6]: (0, _emotion.css)`
      font-size: 0.875rem;
    `
    },
    headings: {
        root: (0, _emotion.css)`
      font-weight: ${_f36tokens.default.fontWeightMedium};
      line-height: 1.3;
      margin: 0 0 ${_f36tokens.default.spacingS};
      direction: inherit;
    `,
        [_richtexttypes.BLOCKS.HEADING_1]: (0, _emotion.css)`
      font-size: 1.875rem;
    `,
        [_richtexttypes.BLOCKS.HEADING_2]: (0, _emotion.css)`
      font-size: 1.5625rem;
    `,
        [_richtexttypes.BLOCKS.HEADING_3]: (0, _emotion.css)`
      font-size: 1.375rem;
    `,
        [_richtexttypes.BLOCKS.HEADING_4]: (0, _emotion.css)`
      font-size: 1.25rem;
    `,
        [_richtexttypes.BLOCKS.HEADING_5]: (0, _emotion.css)`
      font-size: 1.125rem;
    `,
        [_richtexttypes.BLOCKS.HEADING_6]: (0, _emotion.css)`
      font-size: 1rem;
    `
    }
};
function createHeading(Tag, block) {
    return function Heading(props) {
        const align = props.element.data?.align;
        const style = align ? {
            textAlign: align
        } : undefined;
        return /*#__PURE__*/ _react.createElement(Tag, {
            ...props.attributes,
            className: (0, _emotion.cx)(styles.headings.root, styles.headings[block]),
            style: style
        }, props.children);
    };
}
const HeadingComponents = {
    [_richtexttypes.BLOCKS.HEADING_1]: /*#__PURE__*/ _react.memo(createHeading('h1', _richtexttypes.BLOCKS.HEADING_1)),
    [_richtexttypes.BLOCKS.HEADING_2]: /*#__PURE__*/ _react.memo(createHeading('h2', _richtexttypes.BLOCKS.HEADING_2)),
    [_richtexttypes.BLOCKS.HEADING_3]: /*#__PURE__*/ _react.memo(createHeading('h3', _richtexttypes.BLOCKS.HEADING_3)),
    [_richtexttypes.BLOCKS.HEADING_4]: /*#__PURE__*/ _react.memo(createHeading('h4', _richtexttypes.BLOCKS.HEADING_4)),
    [_richtexttypes.BLOCKS.HEADING_5]: /*#__PURE__*/ _react.memo(createHeading('h5', _richtexttypes.BLOCKS.HEADING_5)),
    [_richtexttypes.BLOCKS.HEADING_6]: /*#__PURE__*/ _react.memo(createHeading('h6', _richtexttypes.BLOCKS.HEADING_6))
};
