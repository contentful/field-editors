import { BLOCKS } from '@contentful/rich-text-types';
import { ELEMENT_TABLE, ELEMENT_TH, ELEMENT_TD, ELEMENT_TR, getEmptyRowNode } from '@udecode/plate-table';
import { isBlockSelected, getAncestorPathFromSelection } from '../../helpers/editor';
import { selectEditor } from '../../internal';
import { getBlockAbove, getStartPoint, getAboveNode, getChildren, isFirstChildPath, isAncestorEmpty, getParentNode, isElement, getNodeEntries, getPreviousPath } from '../../internal/queries';
import { insertNodes, removeNodes, moveNodes } from '../../internal/transforms';
export function insertTableAndFocusFirstCell(editor) {
    const table = {
        type: BLOCKS.TABLE,
        data: {},
        children: [
            getEmptyRowNode(editor, {
                colCount: 2,
                header: true
            }),
            getEmptyRowNode(editor, {
                colCount: 2
            })
        ]
    };
    insertNodes(editor, table);
    if (editor.selection) {
        const tableEntry = getBlockAbove(editor, {
            match: {
                type: BLOCKS.TABLE
            }
        });
        if (!tableEntry) return;
        selectEditor(editor, {
            at: getStartPoint(editor, tableEntry[1])
        });
    }
    replaceEmptyParagraphWithTable(editor);
}
export function isTableActive(editor) {
    const tableElements = [
        ELEMENT_TABLE,
        ELEMENT_TH,
        ELEMENT_TR,
        ELEMENT_TD
    ];
    return tableElements.some((el)=>isBlockSelected(editor, el));
}
export function isTableHeaderEnabled(editor) {
    const tableItem = getAboveNode(editor, {
        match: {
            type: BLOCKS.TABLE
        }
    });
    if (!tableItem) {
        return false;
    }
    const firstRow = getChildren(tableItem)[0];
    if (!firstRow) {
        return false;
    }
    return getChildren(firstRow).every(([node])=>{
        return node.type === BLOCKS.TABLE_HEADER_CELL;
    });
}
export function replaceEmptyParagraphWithTable(editor) {
    const tablePath = getAncestorPathFromSelection(editor);
    if (!tablePath || isFirstChildPath(tablePath)) return;
    const previousPath = getPreviousPath(tablePath);
    if (!previousPath) return;
    const [nodes] = getNodeEntries(editor, {
        at: previousPath,
        match: (node)=>node.type === BLOCKS.PARAGRAPH
    });
    if (!nodes) return;
    const [previousNode] = nodes;
    const isPreviousNodeTextEmpty = isAncestorEmpty(editor, previousNode);
    if (isPreviousNodeTextEmpty) {
        moveNodes(editor, {
            at: tablePath,
            to: previousPath
        });
        removeNodes(editor, {
            at: tablePath
        });
    }
}
export const getNoOfMissingTableCellsInRow = (editor, rowEntry)=>{
    const [, rowPath] = rowEntry;
    const parent = getParentNode(editor, rowPath);
    if (!parent) {
        throw new Error('table rows must be wrapped in a table node');
    }
    const tableWidth = Math.max(...getChildren(parent).map((entry)=>getChildren(entry).length));
    const rowWidth = getChildren(rowEntry).length;
    return tableWidth - rowWidth;
};
export const createEmptyTableCells = (count)=>{
    const emptyTableCell = {
        type: BLOCKS.TABLE_CELL,
        data: {},
        children: [
            {
                type: BLOCKS.PARAGRAPH,
                data: {},
                children: [
                    {
                        text: ''
                    }
                ]
            }
        ]
    };
    return new Array(count).fill(emptyTableCell);
};
export const isNotEmpty = (_, entry)=>{
    return getChildren(entry).length !== 0;
};
export const isTable = (node)=>{
    return isElement(node) && node.type === BLOCKS.TABLE;
};
