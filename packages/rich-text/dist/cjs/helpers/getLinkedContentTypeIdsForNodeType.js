"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return getLinkedContentTypeIdsForNodeType;
    }
});
const _find = /*#__PURE__*/ _interop_require_default(require("lodash/find"));
const _flow = /*#__PURE__*/ _interop_require_default(require("lodash/flow"));
const _get = /*#__PURE__*/ _interop_require_default(require("lodash/get"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function getLinkedContentTypeIdsForNodeType(field, nodeType) {
    return (0, _flow.default)((v)=>(0, _find.default)(v, 'nodes'), (v)=>(0, _get.default)(v, [
            'nodes',
            nodeType
        ]), (v)=>(0, _find.default)(v, 'linkContentType'), (v)=>(0, _get.default)(v, 'linkContentType', []))(field.validations);
}
