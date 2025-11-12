import { BLOCKS } from '@contentful/rich-text-types';
import { insertEmptyParagraph } from '../../helpers/editor';
import { getText, isElement } from '../../internal/queries';
import { isTable } from './helpers';
const trimUnnecessaryTableWrapper = (node)=>{
    if (!isElement(node)) {
        return [
            node
        ];
    }
    if (node.type !== BLOCKS.TABLE || node.children?.length !== 1) {
        return [
            node
        ];
    }
    const row = node.children[0];
    if (row?.children?.length !== 1) {
        return [
            node
        ];
    }
    const cell = row.children[0];
    return cell.children;
};
export const insertTableFragment = (editor)=>{
    const { insertFragment } = editor;
    return (fragments)=>{
        if (!editor.selection) {
            return;
        }
        fragments = fragments.flatMap(trimUnnecessaryTableWrapper);
        const isInsertingTable = fragments.some((fragment)=>isTable(fragment));
        const isTableFirstFragment = fragments.findIndex((fragment)=>isTable(fragment)) === 0;
        const currentLineHasText = getText(editor, editor.selection?.focus.path) !== '';
        if (isInsertingTable && isTableFirstFragment && currentLineHasText) {
            insertEmptyParagraph(editor);
        }
        return insertFragment(fragments);
    };
};
