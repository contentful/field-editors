import { BLOCKS } from '@contentful/rich-text-types';
import { getTableEntries, onKeyDownTable as defaultKeyDownTable } from '@udecode/plate-table';
import { insertEmptyParagraph } from '../../helpers/editor';
import { blurEditor } from '../../internal/misc';
import { getAboveNode, getText, isFirstChild, isLastChildPath } from '../../internal/queries';
import { addRowBelow } from './actions';
export const onKeyDownTable = (editor, plugin)=>{
    const defaultHandler = defaultKeyDownTable(editor, plugin);
    return (event)=>{
        const windowSelection = window.getSelection();
        if (windowSelection?.anchorNode?.attributes) {
            const blockType = windowSelection.anchorNode.attributes?.['data-block-type']?.value;
            const isBeforeTable = blockType === BLOCKS.TABLE;
            if (isBeforeTable) {
                if (event.key === 'Enter') {
                    const above = getAboveNode(editor, {
                        match: {
                            type: BLOCKS.TABLE
                        }
                    });
                    if (!above) return;
                    const [, tablePath] = above;
                    insertEmptyParagraph(editor, {
                        at: tablePath,
                        select: true
                    });
                }
                event.preventDefault();
                event.stopPropagation();
                return;
            }
        }
        if (event.key === 'Backspace') {
            const entry = getTableEntries(editor, {});
            if (entry) {
                const { table, row, cell } = entry;
                const cellText = getText(editor, cell[1]);
                const isFirstCell = isFirstChild(row[1]);
                const isFirstRow = isFirstChild(table[1]);
                if (isFirstCell && isFirstRow && !cellText) {
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
            }
        }
        if (event.key === 'Tab' && !event.shiftKey) {
            event.preventDefault();
            const entry = getTableEntries(editor, {});
            if (entry) {
                const { table, row, cell } = entry;
                const isLastCell = isLastChildPath(row, cell[1]);
                const isLastRow = isLastChildPath(table, row[1]);
                if (isLastRow && isLastCell) {
                    addRowBelow(editor);
                    return;
                } else {
                    defaultHandler(event);
                }
            }
        }
        if (event.key === 'Escape') {
            blurEditor(editor);
        }
    };
};
