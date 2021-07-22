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
import { getKeyboardEvents, insertTableWithTrailingParagraph, isTableActive } from './helpers';
import { EditorToolbarButton } from '@contentful/forma-36-react-components';
import { TableActions } from './TableActions';
import { someNode } from '@udecode/slate-plugins-common';
import { useAnchorNode } from './useAnchorNode';

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
  const editor = useStoreEditor();
  const selectedNode = useAnchorNode();
  const [isFocused, setFocused] = React.useState(false);

  React.useEffect(() => {
    if (!editor) {
      return;
    }

    // Checks if this TD is focused by verifying that the HTML
    // Node under the cursor is a child of this TD.
    setFocused(
      !!(
        someNode(editor, { match: { type: ELEMENT_TABLE } }) &&
        props.attributes.ref.current?.contains(selectedNode)
      )
    );
  }, [editor, selectedNode, props.attributes, setFocused]);

  return (
    <td
      {...props.attributes}
      // may include `colspan` and/or `rowspan`
      {...(props.element.data as TableCell['data'])}
      className={styles[BLOCKS.TABLE_CELL]}>
      {isFocused && <TableActions />}
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
  const isActive = editor && isTableActive(editor);

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!editor) return;

    insertTableWithTrailingParagraph(editor, {});
  }

  if (!editor) return null;

  return (
    <EditorToolbarButton
      icon="Table"
      tooltip="Table"
      label="Table"
      testId="table-toolbar-button"
      onClick={handleClick}
      // TODO: active state looks off since the button will be disabled. Do we still need it?
      isActive={isActive}
      disabled={props.isDisabled}
    />
  );
}
