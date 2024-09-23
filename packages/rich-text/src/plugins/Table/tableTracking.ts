import { BLOCKS } from '@contentful/rich-text-types';

import { isElement } from '../../internal/queries';
import { Node, PlateEditor } from '../../internal/types';
import { getPastingSource } from '../../plugins/Tracking';
import type { NodeTransformer } from '../Normalizer';

function hasTables(nodes: Node[]) {
  return nodes.some(({ type }) => {
    return type === BLOCKS.TABLE;
  });
}

const isTableHeaderCell = ({ type }: Node) => type === BLOCKS.TABLE_HEADER_CELL;

function hasHeadersOutsideFirstRow(nodes: Node[]) {
  return nodes
    .filter(({ type }) => type === BLOCKS.TABLE)
    .flatMap(({ children }) => (children as Node[]).slice(1) as Node[])
    .some(({ children }) => (children as Node[]).some(isTableHeaderCell));
}

export function addTableTrackingEvents(editor: PlateEditor) {
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
          editor.tracking.onViewportAction('paste', {
            tablePasted: true,
            source: getPastingSource(data),
            hasHeadersOutsideFirstRow: hasHeadersOutsideFirstRow(markupAfter),
          });
        }
      }, 1);
    } else {
      insertData(data);
    }
  };
}

export const withInvalidCellChildrenTracking = (transformer: NodeTransformer): NodeTransformer => {
  return (editor, childEntry) => {
    const [node] = childEntry;

    if (isElement(node)) {
      editor.tracking?.onViewportAction('invalidTablePaste', {
        nodeType: node.type,
      });
    }

    return transformer(editor, childEntry);
  };
};
