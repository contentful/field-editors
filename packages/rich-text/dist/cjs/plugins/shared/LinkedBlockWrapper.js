"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LinkedBlockWrapper", {
    enumerable: true,
    get: function() {
        return LinkedBlockWrapper;
    }
});
const _react = /*#__PURE__*/ _interop_require_default(require("react"));
const _emotion = require("emotion");
const _environment = require("../../helpers/environment");
const _utils = require("./utils");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const styles = {
    root: (0, _emotion.css)({
        marginBottom: '1.25rem !important',
        display: 'block'
    }),
    container: (0, _emotion.css)({
        display: 'inline-block',
        verticalAlign: 'text-top',
        width: '100%'
    })
};
function LinkedBlockWrapper({ attributes, card, children, link }) {
    return /*#__PURE__*/ _react.default.createElement("div", {
        ...attributes,
        className: styles.root,
        "data-entity-type": link.sys.linkType,
        "data-entity-id": (0, _utils.getLinkEntityId)(link),
        contentEditable: _environment.IS_CHROME ? undefined : false,
        draggable: _environment.IS_CHROME ? true : undefined
    }, /*#__PURE__*/ _react.default.createElement("div", {
        contentEditable: _environment.IS_CHROME ? false : undefined,
        draggable: _environment.IS_CHROME ? true : undefined,
        className: styles.container
    }, card), children);
}
