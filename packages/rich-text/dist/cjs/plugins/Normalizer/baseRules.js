"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "baseRules", {
    enumerable: true,
    get: function() {
        return baseRules;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _editor = require("../../helpers/editor");
const _transformers = require("../../helpers/transformers");
const _queries = require("../../internal/queries");
const _transforms = require("../../internal/transforms");
const isInline = (node)=>_editor.INLINE_TYPES.includes(node.type);
const isTextContainer = (node)=>_richtexttypes.TEXT_CONTAINERS.includes(node.type);
const baseRules = [
    {
        match: _queries.isText,
        validNode: (editor, [, path])=>{
            const parent = (0, _queries.getParentNode)(editor, path)?.[0];
            return !!parent && (isTextContainer(parent) || isInline(parent) || editor.isVoid(parent));
        },
        transform: (editor, entry)=>{
            return (0, _transformers.transformWrapIn)(_richtexttypes.BLOCKS.PARAGRAPH)(editor, entry);
        }
    },
    {
        match: {
            type: _editor.INLINE_TYPES
        },
        validNode: (editor, [, path])=>{
            const parent = (0, _queries.getParentNode)(editor, path)?.[0];
            return !!parent && isTextContainer(parent);
        },
        transform: (0, _transformers.transformWrapIn)(_richtexttypes.BLOCKS.PARAGRAPH)
    },
    {
        match: _queries.isText,
        validNode: (_editor, [node])=>typeof node.text === 'string' && !node.text.includes('\r'),
        transform: (editor, [node, path])=>{
            return (0, _transforms.insertText)(editor, node.text.replace(/\r/g, ''), {
                at: path
            });
        }
    }
];
