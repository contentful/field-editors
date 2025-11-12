"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "toSlateValue", {
    enumerable: true,
    get: function() {
        return toSlateValue;
    }
});
const _contentfulslatejsadapter = require("@contentful/contentful-slatejs-adapter");
const _richtexttypes = require("@contentful/rich-text-types");
const _Schema = /*#__PURE__*/ _interop_require_default(require("../constants/Schema"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const isTextElement = (node)=>'text' in node;
function sanitizeIncomingSlateDoc(nodes = []) {
    return nodes.map((node)=>{
        if (isTextElement(node)) {
            return node;
        }
        if (node.children?.length === 0) {
            return {
                ...node,
                children: [
                    {
                        text: '',
                        data: {}
                    }
                ]
            };
        }
        return {
            ...node,
            children: sanitizeIncomingSlateDoc(node?.children)
        };
    });
}
const toSlateValue = (doc)=>{
    const hasContent = (doc)=>{
        return (doc?.content || []).length > 0;
    };
    const slateDoc = (0, _contentfulslatejsadapter.toSlatejsDocument)({
        document: doc && hasContent(doc) ? doc : _richtexttypes.EMPTY_DOCUMENT,
        schema: _Schema.default
    });
    return sanitizeIncomingSlateDoc(slateDoc);
};
