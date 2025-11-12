"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "styles", {
    enumerable: true,
    get: function() {
        return styles;
    }
});
const _f36tokens = /*#__PURE__*/ _interop_require_default(require("@contentful/f36-tokens"));
const _emotion = require("emotion");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const styles = {
    hyperlinkWrapper: (0, _emotion.css)({
        display: 'inline',
        position: 'static',
        a: {
            fontSize: 'inherit !important'
        }
    }),
    iconButton: (0, _emotion.css)({
        padding: `${_f36tokens.default.spacing2Xs} ${_f36tokens.default.spacingXs}`
    }),
    openLink: (0, _emotion.css)({
        display: 'inline-block',
        marginLeft: _f36tokens.default.spacingXs,
        marginRight: _f36tokens.default.spacingXs,
        maxWidth: '22ch',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    }),
    popover: (0, _emotion.css)({
        zIndex: _f36tokens.default.zIndexModal
    }),
    hyperlink: (0, _emotion.css)({
        position: 'relative',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
        fontSize: 'inherit !important',
        display: 'inline !important',
        direction: 'inherit',
        '&:hover': {
            fill: _f36tokens.default.gray900,
            textDecoration: 'none'
        },
        '&:focus': {
            fill: _f36tokens.default.gray900
        },
        span: {
            display: 'inline'
        }
    })
};
