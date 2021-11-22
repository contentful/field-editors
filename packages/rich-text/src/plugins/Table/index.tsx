import { css } from 'emotion';
import * as React from 'react';
import * as Slate from 'slate-react';
import tokens from '@contentful/f36-tokens';
import { TableIcon } from '@contentful/f36-icons';
import { ToolbarButton } from '../shared/ToolbarButton';
import { BLOCKS, CONTAINERS, TableCell, TableHeaderCell } from '@contentful/rich-text-types';
import {
  PlateEditor,
  ELEMENT_TD,
  ELEMENT_TR,
  ELEMENT_TH,
  ELEMENT_TABLE,
  createTablePlugin as createTablePluginFromUdecode,
  getTableOnKeyDown,
} from '@udecode/plate';
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer';
import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';

import schema from '../../constants/Schema';
import { TableActions } from './TableActions';
import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { CustomElement, CustomSlatePluginOptions } from '../../types';
import { isTableActive, insertTableAndFocusFirstCell } from './helpers';
import { TrackingProvider, useTrackingContext } from '../../TrackingProvider';
import { Element, Node, Text, Transforms } from 'slate';
import {
  currentSelectionPrecedesTableCell,
  currentSelectionStartsTableCell,
} from '../../helpers/editor';

const styles = {
  [BLOCKS.TABLE]: css`
    margin-bottom: 1.5em;
    border-collapse: collapse;
    border-radius: 5px;
    border-style: hidden;
    box-shadow: 0 0 0 1px ${tokens.gray400};
    width: 100%;
    table-layout: fixed;
    overflow: hidden;
  `,
  [BLOCKS.TABLE_ROW]: css`
    border: 1px solid ${tokens.gray400};
    &:hover td {
      background-color: transparent !important;
    }
  `,
  [BLOCKS.TABLE_HEADER_CELL]: css`
    background-color: ${tokens.gray200};
    border: 1px solid ${tokens.gray400};
    padding: 10px 12px;
    font-weight: ${tokens.fontWeightMedium};
    text-align: left;
    min-width: 48px;
    position: relative;
    div:last-child {
      margin-bottom: 0;
    }
  `,
  [BLOCKS.TABLE_CELL]: css`
    border: 1px solid ${tokens.gray400};
    padding: 10px 12px;
    min-width: 48px;
    position: relative;
    div:last-child {
      margin-bottom: 0;
    }
  `,
};

const slateNodeToText = (node: CustomElement): string => {
  const contentfulNode = toContentfulDocument({ document: [node], schema });
  return documentToPlainTextString(contentfulNode);
};

export const Table = (props: Slate.RenderElementProps) => (
  <table {...props.attributes} className={styles[BLOCKS.TABLE]}>
    <tbody>{props.children}</tbody>
  </table>
);

export const TR = (props: Slate.RenderElementProps) => (
  <tr {...props.attributes} className={styles[BLOCKS.TABLE_ROW]}>
    {props.children}
  </tr>
);

export const TH = (props: Slate.RenderElementProps) => {
  const isSelected = Slate.useSelected();

  return (
    <th
      {...props.attributes}
      // may include `colspan` and/or `rowspan`
      {...(props.element.data as TableHeaderCell['data'])}
      className={styles[BLOCKS.TABLE_HEADER_CELL]}>
      {isSelected && <TableActions />}
      {props.children}
    </th>
  );
};
export const TD = (props: Slate.RenderElementProps) => {
  const isSelected = Slate.useSelected();

  return (
    <td
      {...props.attributes}
      // may include `colspan` and/or `rowspan`
      {...(props.element.data as TableCell['data'])}
      className={styles[BLOCKS.TABLE_CELL]}>
      {isSelected && <TableActions />}
      {props.children}
    </td>
  );
};

export const withTableOptions: CustomSlatePluginOptions = {
  [ELEMENT_TABLE]: {
    type: BLOCKS.TABLE,
    component: Table,
  },
  [ELEMENT_TR]: {
    type: BLOCKS.TABLE_ROW,
    component: TR,
  },
  [ELEMENT_TH]: {
    type: BLOCKS.TABLE_HEADER_CELL,
    component: TH,
  },
  [ELEMENT_TD]: {
    type: BLOCKS.TABLE_CELL,
    component: TD,
  },
};

function addTableTrackingEvents(editor: PlateEditor, { onViewportAction }: TrackingProvider) {
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
          onViewportAction('paste', {
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

const paragraph = () => ({ type: BLOCKS.PARAGRAPH, data: {}, children: [] });

function addTableNormalization(editor) {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // TODO: This should be enforced by sanitizeSlateDoc() but the internal
    // editor value can be different.
    // cf. https://github.com/ianstormtaylor/slate/issues/2206
    const cellTypes: string[] = [BLOCKS.TABLE_CELL, BLOCKS.TABLE_HEADER_CELL];
    if (Element.isElement(node) && cellTypes.includes((node as CustomElement).type)) {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (Text.isText(child)) {
          Transforms.wrapNodes(editor, paragraph(), { at: childPath });
        } else if (!CONTAINERS[node.type].includes(child.type)) {
          const paragraphWithTextFromNode = {
            ...paragraph(),
            children: [{ text: slateNodeToText(child) }],
          };
          Transforms.removeNodes(editor, { at: childPath });
          Transforms.insertNodes(editor, paragraphWithTextFromNode, { at: childPath });
        }
      }
    }

    normalizeNode(entry);
  };
}

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

function createWithTableEvents(tracking: TrackingProvider) {
  return function withTableEvents(editor: PlateEditor) {
    addTableTrackingEvents(editor, tracking);
    addTableNormalization(editor);
    const handleKeyDownFromPlateUdecode = getTableOnKeyDown()(editor);
    return function handleKeyDown(event: React.KeyboardEvent) {
      if (
        (event.key === 'Backspace' && currentSelectionStartsTableCell(editor)) ||
        (event.key === 'Delete' && currentSelectionPrecedesTableCell(editor))
      ) {
        // The default behavior here would be to delete the preceding or forthcoming
        // leaf node, in this case a cell or header cell. But we don't want to do that,
        // because it would leave us with a non-standard number of table cells.
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      handleKeyDownFromPlateUdecode(event);
    };
  };
}

export const createTablePlugin = (tracking: TrackingProvider) => ({
  ...createTablePluginFromUdecode(),
  onKeyDown: createWithTableEvents(tracking),
  withOverrides: (editor) => {
    const { insertFragment } = editor;

    editor.insertFragment = (fragments) => {
      // We need to make sure we have a new, empty and clean paragraph in order to paste tables as-is due to how Slate behaves
      // More info: https://github.com/ianstormtaylor/slate/pull/4489 and https://github.com/ianstormtaylor/slate/issues/4542
      const fragmentHasTable = fragments.some((fragment) => fragment.type === BLOCKS.TABLE);
      if (fragmentHasTable) {
        const emptyParagraph: CustomElement = {
          type: BLOCKS.PARAGRAPH,
          children: [{ text: '' }],
          data: {},
          isVoid: false,
        };
        Transforms.insertNodes(editor, emptyParagraph);
      }

      insertFragment(fragments);
    };

    return editor;
  },
});

interface ToolbarTableButtonProps {
  isDisabled: boolean | undefined;
}

export function ToolbarTableButton(props: ToolbarTableButtonProps) {
  const editor = useContentfulEditor();
  const { onViewportAction } = useTrackingContext();
  const isActive = editor && isTableActive(editor);

  async function handleClick() {
    if (!editor) return;

    onViewportAction('insertTable');
    insertTableAndFocusFirstCell(editor);
    Slate.ReactEditor.focus(editor);
  }

  if (!editor) return null;

  return (
    <ToolbarButton
      title="Table"
      testId="table-toolbar-button"
      onClick={handleClick}
      // TODO: active state looks off since the button will be disabled. Do we still need it?
      isActive={isActive}
      isDisabled={props.isDisabled}>
      <TableIcon />
    </ToolbarButton>
  );
}
