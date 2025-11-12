"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    DEFAULT_ENABLED_NODE_TYPES: function() {
        return DEFAULT_ENABLED_NODE_TYPES;
    },
    VALIDATABLE_NODE_TYPES: function() {
        return VALIDATABLE_NODE_TYPES;
    },
    VALIDATIONS: function() {
        return VALIDATIONS;
    },
    isMarkEnabled: function() {
        return isMarkEnabled;
    },
    isNodeTypeEnabled: function() {
        return isNodeTypeEnabled;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _find = /*#__PURE__*/ _interop_require_default(require("lodash/find"));
const _flow = /*#__PURE__*/ _interop_require_default(require("lodash/flow"));
const _get = /*#__PURE__*/ _interop_require_default(require("lodash/get"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const VALIDATIONS = {
    ENABLED_MARKS: 'enabledMarks',
    ENABLED_NODE_TYPES: 'enabledNodeTypes'
};
const DEFAULT_ENABLED_NODE_TYPES = [
    _richtexttypes.BLOCKS.DOCUMENT,
    _richtexttypes.BLOCKS.PARAGRAPH,
    'text'
];
const VALIDATABLE_NODE_TYPES = [].concat(_richtexttypes.TOP_LEVEL_BLOCKS).filter((type)=>type !== _richtexttypes.BLOCKS.PARAGRAPH).concat(Object.values(_richtexttypes.INLINES));
const getRichTextValidation = (field, validationType)=>(0, _flow.default)((v)=>(0, _find.default)(v, validationType), (v)=>(0, _get.default)(v, validationType))(field.validations);
const isFormattingOptionEnabled = (field, validationType, nodeTypeOrMark)=>{
    const enabledFormattings = getRichTextValidation(field, validationType);
    if (enabledFormattings === undefined) {
        return true;
    }
    return DEFAULT_ENABLED_NODE_TYPES.concat(enabledFormattings).includes(nodeTypeOrMark);
};
const isNodeTypeEnabled = (field, nodeType)=>isFormattingOptionEnabled(field, VALIDATIONS.ENABLED_NODE_TYPES, nodeType);
const isMarkEnabled = (field, mark)=>isFormattingOptionEnabled(field, VALIDATIONS.ENABLED_MARKS, mark);
