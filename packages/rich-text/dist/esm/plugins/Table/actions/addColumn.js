import { BLOCKS } from '@contentful/rich-text-types';
import { getEmptyCellNode } from '@udecode/plate-table';
import { getAboveNode, getNextPath, someNode } from '../../../internal/queries';
import { insertNodes } from '../../../internal/transforms';
const addColumn = (editor, { header }, getNextCellPath)=>{
    if (someNode(editor, {
        match: {
            type: BLOCKS.TABLE
        }
    })) {
        const currentCellItem = getAboveNode(editor, {
            match: {
                type: [
                    BLOCKS.TABLE_HEADER_CELL,
                    BLOCKS.TABLE_CELL
                ]
            }
        });
        const currentTableItem = getAboveNode(editor, {
            match: {
                type: BLOCKS.TABLE
            }
        });
        if (currentCellItem && currentTableItem) {
            const nextCellPath = getNextCellPath(currentCellItem[1]);
            const newCellPath = nextCellPath.slice();
            const replacePathPos = newCellPath.length - 2;
            currentTableItem[0].children.forEach((_, rowIdx)=>{
                newCellPath[replacePathPos] = rowIdx;
                insertNodes(editor, getEmptyCellNode(editor, {
                    header: header && rowIdx === 0
                }), {
                    at: newCellPath,
                    select: rowIdx === 0
                });
            });
        }
    }
};
export const addColumnRight = (editor, options)=>{
    addColumn(editor, options, (currentCellPath)=>getNextPath(currentCellPath));
};
export const addColumnLeft = (editor, options)=>{
    addColumn(editor, options, (currentCellPath)=>currentCellPath);
};
