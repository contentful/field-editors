import { BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';
import { INLINE_TYPES } from '../../helpers/editor';
import { transformWrapIn } from '../../helpers/transformers';
import { getParentNode, isText } from '../../internal/queries';
import { insertText } from '../../internal/transforms';
const isInline = (node)=>INLINE_TYPES.includes(node.type);
const isTextContainer = (node)=>TEXT_CONTAINERS.includes(node.type);
export const baseRules = [
    {
        match: isText,
        validNode: (editor, [, path])=>{
            const parent = getParentNode(editor, path)?.[0];
            return !!parent && (isTextContainer(parent) || isInline(parent) || editor.isVoid(parent));
        },
        transform: (editor, entry)=>{
            return transformWrapIn(BLOCKS.PARAGRAPH)(editor, entry);
        }
    },
    {
        match: {
            type: INLINE_TYPES
        },
        validNode: (editor, [, path])=>{
            const parent = getParentNode(editor, path)?.[0];
            return !!parent && isTextContainer(parent);
        },
        transform: transformWrapIn(BLOCKS.PARAGRAPH)
    },
    {
        match: isText,
        validNode: (_editor, [node])=>typeof node.text === 'string' && !node.text.includes('\r'),
        transform: (editor, [node, path])=>{
            return insertText(editor, node.text.replace(/\r/g, ''), {
                at: path
            });
        }
    }
];
