import { BLOCKS } from '@contentful/rich-text-types';
import { Editor } from 'slate';
import { isElement } from '../../internal/queries';
import { setNodes } from '../../internal/transforms';
export const ALIGNABLE_BLOCKS = [
    BLOCKS.PARAGRAPH,
    BLOCKS.HEADING_1,
    BLOCKS.HEADING_2,
    BLOCKS.HEADING_3,
    BLOCKS.HEADING_4,
    BLOCKS.HEADING_5,
    BLOCKS.HEADING_6,
    BLOCKS.QUOTE,
    BLOCKS.LIST_ITEM
];
export function isAlignableBlock(nodeType) {
    return ALIGNABLE_BLOCKS.includes(nodeType);
}
export function getAlignment(editor) {
    if (!editor.selection) return null;
    const matches = Array.from(Editor.nodes(editor, {
        match: (n)=>isElement(n) && isAlignableBlock(n.type),
        mode: 'lowest'
    }));
    if (matches.length === 0) return null;
    const [node] = matches[0];
    if (isElement(node) && node.data) {
        return node.data.align || 'left';
    }
    return 'left';
}
export function isAlignmentActive(editor, alignment) {
    return getAlignment(editor) === alignment;
}
export function setAlignment(editor, alignment) {
    if (!editor.selection) return;
    const nodes = Array.from(Editor.nodes(editor, {
        match: (n)=>isElement(n) && isAlignableBlock(n.type),
        mode: 'lowest'
    }));
    if (nodes.length === 0) return;
    for (const [node, path] of nodes){
        if (isElement(node)) {
            const nodeData = node.data || {};
            const newData = {
                ...nodeData,
                align: alignment
            };
            setNodes(editor, {
                data: newData
            }, {
                at: path
            });
        }
    }
}
