import { BLOCKS } from '@contentful/rich-text-types';

import { CustomElement, RichTextEditor } from '../../types';

function hasTables(nodes: CustomElement[]) {
  return nodes.some(({ type }) => {
    return type === BLOCKS.TABLE;
  });
}

const isTableHeaderCell = ({ type }) => type === BLOCKS.TABLE_HEADER_CELL;

function hasHeadersOutsideFirstRow(nodes: CustomElement[]) {
  return nodes
    .filter(({ type }) => type === BLOCKS.TABLE)
    .flatMap(({ children }) => children.slice(1) as CustomElement[])
    .some(({ children }) => (children as CustomElement[]).some(isTableHeaderCell));
}

export function addTableTrackingEvents(editor: RichTextEditor) {
  const { insertData } = editor;
  editor.insertData = (data: DataTransfer) => {
    const html = data.getData('text/html');

    if (html) {
      const { children: markupBefore } = editor;
      insertData(data);
      const { children: markupAfter } = editor;
      setTimeout(() => {
        if (hasTables(markupBefore)) return;
        if (hasTables(markupAfter)) {
          editor.tracking?.onViewportAction('paste', {
            tablePasted: true,
            hasHeadersOutsideFirstRow: hasHeadersOutsideFirstRow(markupAfter),
          });
        }
      }, 1);
    } else {
      insertData(data);
    }
  };
}
