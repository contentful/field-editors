"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
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
    container: (0, _emotion.css)({
        position: 'absolute',
        zIndex: _f36tokens.default.zIndexNotification,
        fontWeight: _f36tokens.default.fontWeightNormal,
        fontStyle: 'normal',
        fontFamily: _f36tokens.default.fontStackPrimary,
        'ul, ol, dl': {
            listStyle: 'none',
            marginLeft: 0
        }
    }),
    menuPoper: (0, _emotion.css)({
        zIndex: _f36tokens.default.zIndexModal
    }),
    menuContent: (0, _emotion.css)({
        width: '400px',
        maxHeight: '300px'
    }),
    menuList: (0, _emotion.css)({
        overflow: 'auto',
        maxHeight: '200px'
    }),
    menuItem: (0, _emotion.css)({
        display: 'block',
        width: '100%',
        background: 'none',
        border: 0,
        margin: 0,
        outline: 'none',
        fontSize: _f36tokens.default.fontSizeM,
        lineHeight: _f36tokens.default.lineHeightM,
        fontWeight: _f36tokens.default.fontWeightNormal,
        position: 'relative',
        textAlign: 'left',
        padding: `${_f36tokens.default.spacingXs} ${_f36tokens.default.spacingM}`,
        wordBreak: 'break-word',
        whiteSpace: 'break-spaces',
        cursor: 'pointer',
        hyphens: 'auto',
        minWidth: '150px',
        textDecoration: 'none',
        color: _f36tokens.default.gray800,
        '&:hover': {
            backgroundColor: _f36tokens.default.gray100
        },
        '&:disabled': {
            opacity: 0.5,
            cursor: 'auto'
        }
    }),
    menuItemSelected: (0, _emotion.css)({
        boxShadow: `inset ${_f36tokens.default.glowPrimary}`,
        borderRadius: _f36tokens.default.borderRadiusMedium
    }),
    menuDivider: (0, _emotion.css)({
        border: 'none',
        width: '100%',
        height: '1px',
        background: _f36tokens.default.gray300,
        margin: `${_f36tokens.default.spacingXs} 0`
    }),
    menuHeader: (0, _emotion.css)({
        zIndex: _f36tokens.default.zIndexDefault,
        top: 0,
        backgroundColor: _f36tokens.default.gray100,
        padding: _f36tokens.default.spacingM
    }),
    menuFooter: (0, _emotion.css)({
        position: 'sticky',
        bottom: 0,
        backgroundColor: _f36tokens.default.gray100,
        padding: _f36tokens.default.spacingM
    }),
    footerList: (0, _emotion.css)({
        listStyle: 'none',
        color: _f36tokens.default.gray600,
        fontSize: _f36tokens.default.fontSizeM
    }),
    thumbnail: (0, _emotion.css)({
        width: '30px',
        height: '30px',
        objectFit: 'cover'
    })
};
const _default = styles;
