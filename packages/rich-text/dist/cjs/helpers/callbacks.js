"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createOnChangeCallback", {
    enumerable: true,
    get: function() {
        return createOnChangeCallback;
    }
});
const _contentfulslatejsadapter = require("@contentful/contentful-slatejs-adapter");
const _debounce = /*#__PURE__*/ _interop_require_default(require("lodash/debounce"));
const _Schema = /*#__PURE__*/ _interop_require_default(require("../constants/Schema"));
const _removeInternalMarks = require("./removeInternalMarks");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const createOnChangeCallback = (handler)=>(0, _debounce.default)((document)=>{
        const doc = (0, _removeInternalMarks.removeInternalMarks)((0, _contentfulslatejsadapter.toContentfulDocument)({
            document: document,
            schema: _Schema.default
        }));
        const cleanedDocument = (0, _removeInternalMarks.removeInternalMarks)(doc);
        handler?.(cleanedDocument);
    }, 500);
