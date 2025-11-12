"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return getAllowedResourcesForNodeType;
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
function getAllowedResourcesForNodeType(field, nodeType) {
    return (0, _flow.default)((validations)=>(0, _find.default)(validations, 'nodes'), (validations)=>(0, _get.default)(validations, [
            'nodes',
            nodeType,
            'allowedResources'
        ], []))(field.validations);
}
