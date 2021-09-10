import * as React from 'react';
import * as Slate from 'slate-react';
import { css } from 'emotion';
import { BLOCKS, TableCell, TableHeaderCell } from '@contentful/rich-text-types';
import {
  ELEMENT_TD,
  ELEMENT_TR,
  ELEMENT_TH,
  ELEMENT_TABLE,
  createTablePlugin as createTablePluginFromUdecode,
  // getTableOnKeyDown,
  // getTableCellEntry,
  getPreviousTableCell,
  getNextTableCell,
} from '@udecode/plate-table';
import { CustomElement, CustomSlatePluginOptions } from 'types';
import tokens from '@contentful/forma-36-tokens';
import { SPEditor, getPlatePluginType } from '@udecode/plate-core';
import { isTableActive, insertTableAndFocusFirstCell } from './helpers';
import { EditorToolbarButton } from '@contentful/forma-36-react-components';
import { TableActions } from './TableActions';
import { TrackingProvider, useTrackingContext } from '../../TrackingProvider';
import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { Transforms } from 'slate';
import { someNode, getParent, getAbove } from '@udecode/plate-common';

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
    background-color: ${tokens.gray100};
    border: 1px solid ${tokens.gray400};
    padding: 10px 12px;
    font-weight: ${tokens.fontWeightDemiBold};
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

function addTableTrackingEvents(editor: SPEditor, { onViewportAction }: TrackingProvider) {
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
          onViewportAction('paste', { tablePasted: true });
        }
      }, 1);
    }
  };
}

function hasTables(nodes: CustomElement[]) {
  return nodes.some(({ type }) => {
    return type === BLOCKS.TABLE;
  });
}

// FIXME: Remove this once https://github.com/udecode/plate/pull/997 is merged
const getTableCellEntry = (editor: SPEditor) => {
  if (
    someNode(editor, {
      match: {
        type: [getPlatePluginType(editor, ELEMENT_TD), getPlatePluginType(editor, ELEMENT_TH)],
      },
    })
  ) {
    const selectionParent = getParent(editor, editor.selection as any);
    if (!selectionParent) return;
    const [, paragraphPath] = selectionParent;

    const tableCell =
      getAbove(editor, {
        match: {
          type: [getPlatePluginType(editor, ELEMENT_TD), getPlatePluginType(editor, ELEMENT_TH)],
        },
      }) || getParent(editor, paragraphPath);

    if (!tableCell) return;
    const [tableCellNode, tableCellPath] = tableCell;

    if (
      tableCellNode.type !== getPlatePluginType(editor, ELEMENT_TD) &&
      tableCellNode.type !== getPlatePluginType(editor, ELEMENT_TH)
    )
      return;

    const tableRow = getParent(editor, tableCellPath);
    if (!tableRow) return;
    const [tableRowNode, tableRowPath] = tableRow;

    if (tableRowNode.type !== getPlatePluginType(editor, ELEMENT_TR)) return;

    const tableElement = getParent(editor, tableRowPath);
    if (!tableElement) return;

    return {
      tableElement,
      tableRow,
      tableCell,
    };
  }
};

function createWithTableEvents(tracking: TrackingProvider) {
  return function withTableEvents(editor: SPEditor) {
    addTableTrackingEvents(editor, tracking);
    // const withTableEventsFromUdecode = getTableOnKeyDown()(editor);
    // FIXE: replace with getTableOnKeyDown from udecode once
    // https://github.com/udecode/plate/pull/997 is merged
    return function onKeyDown(e: React.KeyboardEvent) {
      if (e.key === 'Tab') {
        e.preventDefault();
        const res = getTableCellEntry(editor);
        if (!res) return;

        const { tableRow, tableCell } = res;

        const [, tableCellPath] = tableCell;
        const shiftTab = e.shiftKey;
        const tab = !e.shiftKey;
        if (shiftTab) {
          // move left with shift+tab
          const previousCell = getPreviousTableCell(editor, tableCell, tableCellPath, tableRow);
          if (previousCell) {
            const [, previousCellPath] = previousCell;
            Transforms.select(editor, previousCellPath);
          }
        } else if (tab) {
          // move right with tab
          const nextCell = getNextTableCell(editor, tableCell, tableCellPath, tableRow);
          if (nextCell) {
            const [, nextCellPath] = nextCell;
            Transforms.select(editor, nextCellPath);
          }
        }
      }
    };
  };
}

export const createTablePlugin = (tracking: TrackingProvider) => ({
  ...createTablePluginFromUdecode(),
  onKeyDown: createWithTableEvents(tracking),
});

interface ToolbarTableButtonProps {
  isDisabled: boolean | undefined;
}

export function ToolbarTableButton(props: ToolbarTableButtonProps) {
  const editor = useContentfulEditor();
  const { onViewportAction } = useTrackingContext();
  const isActive = editor && isTableActive(editor);

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!editor) return;

    onViewportAction('insertTable');
    insertTableAndFocusFirstCell(editor);
    Slate.ReactEditor.focus(editor);
  }

  if (!editor) return null;

  return (
    <EditorToolbarButton
      icon="Table"
      tooltip="Table"
      tooltipPlace="bottom"
      label="Table"
      testId="table-toolbar-button"
      onClick={handleClick}
      // TODO: active state looks off since the button will be disabled. Do we still need it?
      isActive={isActive}
      disabled={props.isDisabled}
    />
  );
}
