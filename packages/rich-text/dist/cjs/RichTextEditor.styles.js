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
const STYLE_EDITOR_BORDER = `1px solid ${_f36tokens.default.gray400}`;
const styles = {
    root: (0, _emotion.css)({
        position: 'relative'
    }),
    editor: (0, _emotion.css)({
        borderRadius: `0 0 ${_f36tokens.default.borderRadiusMedium} ${_f36tokens.default.borderRadiusMedium}`,
        border: STYLE_EDITOR_BORDER,
        borderTop: 0,
        padding: '20px',
        fontSize: _f36tokens.default.spacingM,
        fontFamily: _f36tokens.default.fontStackPrimary,
        minHeight: '400px',
        overflowY: 'auto',
        background: _f36tokens.default.colorWhite,
        outline: 'none',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
        webkitUserModify: 'read-write-plaintext-only',
        a: {
            span: {
                cursor: 'not-allowed',
                '&:hover': {
                    cursor: 'not-allowed'
                }
            }
        },
        'ul > li > div': {
            margin: 0
        }
    }),
    hiddenToolbar: (0, _emotion.css)({
        borderTop: STYLE_EDITOR_BORDER
    }),
    enabled: (0, _emotion.css)({
        background: _f36tokens.default.colorWhite,
        a: {
            span: {
                cursor: 'pointer',
                '&:hover': {
                    cursor: 'pointer'
                }
            }
        }
    }),
    disabled: (0, _emotion.css)({
        background: _f36tokens.default.gray100,
        cursor: 'not-allowed'
    }),
    rtl: (0, _emotion.css)({
        direction: 'rtl'
    }),
    ltr: (0, _emotion.css)({
        direction: 'ltr'
    })
};
