import { BLOCKS } from '@contentful/rich-text-types';
import { Element } from 'slate';

import { CustomElement, RichTextEditor, TextOrCustomElement } from '../../types';
import { isTable } from './helpers';

function hasTables(nodes: CustomElement[]) {
  return nodes.some(({ type }) => {
    return type === BLOCKS.TABLE;
  });
}

const isTableHeaderCell = ({ type }) => type === BLOCKS.TABLE_HEADER_CELL;

const isTableCellOrHeader = (node: TextOrCustomElement): node is CustomElement => {
  return (
    Element.isElement(node) &&
    [BLOCKS.TABLE_HEADER_CELL, BLOCKS.TABLE_CELL].includes(node.type as BLOCKS)
  );
};

function hasHeadersOutsideFirstRow(nodes: CustomElement[]) {
  return nodes
    .filter(({ type }) => type === BLOCKS.TABLE)
    .flatMap(({ children }) => children.slice(1) as CustomElement[])
    .some(({ children }) => (children as CustomElement[]).some(isTableHeaderCell));
}

function trackInvalidTableCellChildren(editor: RichTextEditor, table: CustomElement) {
  const cells = table.children
    .flatMap((row) => (row as CustomElement).children ?? [])
    .filter(isTableCellOrHeader);

  // get invalid direct children
  const invalidNodeTypes = cells.flatMap((cell) => {
    // Only paragraphs are allowed inside tables at the moment
    return cell.children
      .filter(
        (node): node is CustomElement => Element.isElement(node) && node.type !== BLOCKS.PARAGRAPH
      )
      .map((node) => node.type);
  });

  for (const nodeType of new Set(invalidNodeTypes)) {
    editor.tracking?.onViewportAction('invalidTablePaste', {
      nodeType,
    });
  }
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
          editor.tracking.onViewportAction('paste', {
            tablePasted: true,
            hasHeadersOutsideFirstRow: hasHeadersOutsideFirstRow(markupAfter),
          });
        }
      }, 1);
    } else {
      insertData(data);
    }
  };

  const { insertFragment } = editor;

  editor.insertFragment = (fragment) => {
    const tables = (fragment as TextOrCustomElement[]).filter(isTable) as CustomElement[];

    for (const table of tables) {
      trackInvalidTableCellChildren(editor, table);
    }

    return insertFragment(fragment);
  };
}
