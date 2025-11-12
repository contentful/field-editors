import { BLOCKS } from '@contentful/rich-text-types';
import { getEmptyRowNode } from '@udecode/plate-table';
import { getAboveNode, someNode, getStartPoint, getNextPath } from '../../../internal/queries';
import { select, insertNodes } from '../../../internal/transforms';
const addRow = (editor, getNextRowPath)=>{
    if (someNode(editor, {
        match: {
            type: BLOCKS.TABLE
        }
    })) {
        const currentRowItem = getAboveNode(editor, {
            match: {
                type: BLOCKS.TABLE_ROW
            }
        });
        if (currentRowItem) {
            const [currentRowElem, currentRowPath] = currentRowItem;
            const nextRowPath = getNextRowPath(currentRowPath);
            insertNodes(editor, getEmptyRowNode(editor, {
                header: false,
                colCount: currentRowElem.children.length
            }), {
                at: nextRowPath,
                select: true
            });
            select(editor, getStartPoint(editor, nextRowPath));
        }
    }
};
export const addRowBelow = (editor)=>{
    addRow(editor, (currentRowPath)=>{
        return getNextPath(currentRowPath);
    });
};
export const addRowAbove = (editor)=>{
    addRow(editor, (currentRowPath)=>{
        return currentRowPath;
    });
};
