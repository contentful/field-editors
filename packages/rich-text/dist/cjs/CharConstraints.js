"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CharConstraints", {
    enumerable: true,
    get: function() {
        return CharConstraints;
    }
});
const _react = /*#__PURE__*/ _interop_require_default(require("react"));
const _f36tokens = /*#__PURE__*/ _interop_require_default(require("@contentful/f36-tokens"));
const _fieldeditorshared = require("@contentful/field-editor-shared");
const _emotion = require("emotion");
const _hooks = require("./internal/hooks");
const _SdkProvider = require("./SdkProvider");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const styles = {
    container: (0, _emotion.css)({
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: _f36tokens.default.fontSizeM,
        marginTop: _f36tokens.default.spacingXs,
        color: _f36tokens.default.gray700
    }),
    counterInvalid: (0, _emotion.css)({
        color: _f36tokens.default.red600
    })
};
function CharCounter({ checkConstraints }) {
    const editor = (0, _hooks.usePlateEditorState)();
    const count = editor.getCharacterCount();
    const valid = checkConstraints(count);
    return /*#__PURE__*/ _react.default.createElement("span", {
        className: (0, _emotion.cx)({
            [styles.counterInvalid]: !valid
        })
    }, count, " characters");
}
function CharConstraints() {
    const sdk = (0, _SdkProvider.useSdkContext)();
    const { constraints, checkConstraints } = _react.default.useMemo(()=>{
        const constraints = _fieldeditorshared.ConstraintsUtils.fromFieldValidations(sdk.field.validations, 'RichText');
        const checkConstraints = _fieldeditorshared.ConstraintsUtils.makeChecker(constraints);
        return {
            constraints,
            checkConstraints
        };
    }, [
        sdk.field.validations
    ]);
    return /*#__PURE__*/ _react.default.createElement("div", {
        className: styles.container
    }, /*#__PURE__*/ _react.default.createElement(CharCounter, {
        checkConstraints: checkConstraints
    }), /*#__PURE__*/ _react.default.createElement(_fieldeditorshared.CharValidation, {
        constraints: constraints
    }));
}
