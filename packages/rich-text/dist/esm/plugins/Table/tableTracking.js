import { BLOCKS } from '@contentful/rich-text-types';
import { isElement } from '../../internal/queries';
import { getPastingSource } from '../../plugins/Tracking';
function hasTables(nodes) {
    return nodes.some(({ type })=>{
        return type === BLOCKS.TABLE;
    });
}
const isTableHeaderCell = ({ type })=>type === BLOCKS.TABLE_HEADER_CELL;
function hasHeadersOutsideFirstRow(nodes) {
    return nodes.filter(({ type })=>type === BLOCKS.TABLE).flatMap(({ children })=>children.slice(1)).some(({ children })=>children.some(isTableHeaderCell));
}
export function addTableTrackingEvents(editor) {
    const { insertData } = editor;
    editor.insertData = (data)=>{
        const html = data.getData('text/html');
        if (html) {
            const { children: markupBefore } = editor;
            insertData(data);
            const { children: markupAfter } = editor;
            setTimeout(()=>{
                if (hasTables(markupBefore)) return;
                if (hasTables(markupAfter)) {
                    editor.tracking.onViewportAction('paste', {
                        tablePasted: true,
                        source: getPastingSource(data),
                        hasHeadersOutsideFirstRow: hasHeadersOutsideFirstRow(markupAfter)
                    });
                }
            }, 1);
        } else {
            insertData(data);
        }
    };
}
export const withInvalidCellChildrenTracking = (transformer)=>{
    return (editor, childEntry)=>{
        const [node] = childEntry;
        if (isElement(node)) {
            editor.tracking?.onViewportAction('invalidTablePaste', {
                nodeType: node.type
            });
        }
        return transformer(editor, childEntry);
    };
};
