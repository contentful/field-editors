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
} from '@udecode/plate-table';
import { CustomElement, CustomSlatePluginOptions } from 'types';
import tokens from '@contentful/forma-36-tokens';
import { SPEditor, useStoreEditorRef } from '@udecode/plate-core';
import { insertTableWithTrailingParagraph, isTableActive } from './helpers';
import { EditorToolbarButton } from '@contentful/forma-36-react-components';
import { TableActions } from './TableActions';
import { TrackingProvider, useTrackingContext } from '../../TrackingProvider';

const styles = {
  [BLOCKS.TABLE]: css`
    margin-bottom: 1.5em;
    border-collapse: collapse;
    border-radius: 5px;
    border-style: hidden;
    box-shadow: 0 0 0 1px ${tokens.gray400};
    width: 100%;
    table-layout: fixed;
  `,
  [BLOCKS.TABLE_ROW]: css`
    border: 1px solid ${tokens.gray400};
    &:hover td {
      background-color: transparent !important;
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
    // @ts-expect-error @z0al to be fixed after green tests
    component: Table,
  },
  [ELEMENT_TR]: {
    type: BLOCKS.TABLE_ROW,
    // @ts-expect-error @z0al to be fixed after green tests
    component: TR,
  },
  [ELEMENT_TD]: {
    type: BLOCKS.TABLE_CELL,
    // @ts-expect-error @z0al to be fixed after green tests
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

// We implement this as BFS because it's more likely
// tables will appear earlier in the tree.
function hasTables(nodes: CustomElement[]) {
  const toCheck = ([] as CustomElement[]).concat(nodes);
  while (toCheck.length) {
    const { type, children } = toCheck.shift() as CustomElement;
    if (type === BLOCKS.TABLE) {
      return true;
    } else if (children) {
      // Ideally we'd simply spread here, but we'd need to
      // upgrade TS first.
      Array.prototype.push.apply(toCheck, children);
    }
  }
  return false;
}

function createWithTableEvents(tracking: TrackingProvider) {
  return function withTableEvents(editor: SPEditor) {
    addTableTrackingEvents(editor, tracking);
    const withTableEventsFromUdecode = getTableOnKeyDown()(editor);
    return function onKeyDown(e: React.KeyboardEvent) {
      withTableEventsFromUdecode(e);
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
  const editor = useStoreEditorRef();
  const { onViewportAction } = useTrackingContext();
  const isActive = editor && isTableActive(editor);

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!editor) return;

    onViewportAction('insertTable');
    insertTableWithTrailingParagraph(editor, {});
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
