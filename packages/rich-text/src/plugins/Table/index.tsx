import * as React from 'react';
import * as Slate from 'slate-react';
import { css } from 'emotion';
import { BLOCKS, TableCell } from '@contentful/rich-text-types';
import {
  ELEMENT_TD,
  ELEMENT_TR,
  ELEMENT_TABLE,
  createTablePlugin as createTablePluginFromUdecode,
  getTableOnKeyDown,
} from '@udecode/slate-plugins-table';
import { CustomSlatePluginOptions } from 'types';
import tokens from '@contentful/forma-36-tokens';
import { SPEditor, useStoreEditor } from '@udecode/slate-plugins-core';
import { getKeyboardEvents, insertTableWithTrailingParagraph } from './helpers';
import { EditorToolbarButton } from '@contentful/forma-36-react-components';
import { TableActionsDropdown } from './components/TableActions';

const styles = {
  [BLOCKS.TABLE]: css`
    margin-bottom: 1.5em;
    border-collapse: collapse;
    border-radius: 5px;
    border-style: hidden;
    box-shadow: 0 0 0 1px ${tokens.colorElementDark};
    width: 100%;
    table-layout: fixed;
  `,
  [BLOCKS.TABLE_ROW]: css`
    border: 1px solid ${tokens.colorElementDark};
    &:hover td {
      background-color: transparent !important;
    }
  `,
  [BLOCKS.TABLE_CELL]: css`
    border: 1px solid ${tokens.colorElementDark};
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

export const TD = (props: Slate.RenderElementProps) => {
  return (
    <td
      {...props.attributes}
      // may include `colspan` and/or `rowspan`
      {...(props.element.data as TableCell['data'])}
      className={styles[BLOCKS.TABLE_CELL]}>
      {props.children}

      <TableActionsDropdown />
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
  [ELEMENT_TD]: {
    type: BLOCKS.TABLE_CELL,
    component: TD,
  },
};

function withTableEvents(editor: SPEditor) {
  const withTableEventsFromUdecode = getTableOnKeyDown()(editor);
  const keyboardEvents = getKeyboardEvents(withTableOptions);
  return function onKeyDown(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey) {
      const tableAction = keyboardEvents[e.key];
      if (tableAction) {
        e.preventDefault();
        return tableAction(editor);
      }
    }
    withTableEventsFromUdecode(e);
  };
}

export const createTablePlugin: typeof createTablePluginFromUdecode = () => ({
  ...createTablePluginFromUdecode(),
  onKeyDown: withTableEvents,
});

interface ToolbarTableButtonProps {
  isDisabled: boolean | undefined;
}

export function ToolbarTableButton(props: ToolbarTableButtonProps) {
  const editor = useStoreEditor();

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!editor) return;

    insertTableWithTrailingParagraph(editor, {});
  }

  if (!editor) return null;

  return (
    <EditorToolbarButton
      // TODO: fix icon
      icon="Drag"
      tooltip="Table"
      label="Table"
      testId="table-toolbar-button"
      onClick={handleClick}
      disabled={props.isDisabled}
    />
  );
}
