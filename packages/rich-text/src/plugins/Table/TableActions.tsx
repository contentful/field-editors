import React from 'react';
import { css } from 'emotion';
import * as Slate from 'slate-react';
import tokens from '@contentful/forma-36-tokens';
import { SPEditor } from '@udecode/plate-core';
import { TablePluginOptions, deleteColumn, deleteRow, deleteTable } from '@udecode/plate-table';
import {
  IconButton,
  Dropdown,
  DropdownList,
  DropdownListItem,
} from '@contentful/forma-36-react-components';

import { addRowAbove, addColumnLeft, addColumnRight, addRowBelow } from './actions';
import { RichTextTrackingActionName, useTrackingContext } from '../../TrackingProvider';
import { getNodeEntryFromSelection, getTableSize } from '../../helpers/editor';
import { BLOCKS } from '@contentful/rich-text-types';
import { useContentfulEditor } from '../../ContentfulEditorProvider';

export const styles = {
  topRight: css({
    position: 'absolute',
    top: tokens.spacingXs,
    right: tokens.spacingXs,
  }),
};

const getCurrentTableSize = (editor: SPEditor): Record<'numRows' | 'numColumns', number> | null => {
  const [table] = getNodeEntryFromSelection(editor, BLOCKS.TABLE);
  return table ? getTableSize(table) : null;
};

type TableAction = (editor: SPEditor, options: TablePluginOptions) => void;

export const TableActions = () => {
  const editor = useContentfulEditor();
  const { onViewportAction } = useTrackingContext();
  const [isOpen, setOpen] = React.useState(false);

  const close = () => {
    setOpen(false);

    if (!editor) return;

    // Makes sure we keep the editor in focus when clicking on/out
    // the dropdown menu
    Slate.ReactEditor.focus(editor);
  };

  const action =
    (cb: TableAction, type: 'insert' | 'remove', element: 'Table' | 'Row' | 'Column') => () => {
      if (!editor?.selection) return;
      close();
      const tableSize = getCurrentTableSize(editor);
      cb(editor, {});
      const actionName = `${type}Table${element === 'Table' ? '' : element}`;
      onViewportAction(actionName as RichTextTrackingActionName, { tableSize });
    };

  return (
    <Dropdown
      className={styles.topRight}
      position="left"
      isOpen={isOpen}
      onClose={close}
      testId="cf-table-actions"
      toggleElement={
        <IconButton
          iconProps={{ icon: 'ChevronDown', size: 'tiny' }}
          onClick={() => setOpen(true)}
          tabIndex={-1}
        />
      }>
      <DropdownList>
        <DropdownListItem onClick={action(addRowAbove, 'insert', 'Row')}>
          Add row above
        </DropdownListItem>
        <DropdownListItem onClick={action(addRowBelow, 'insert', 'Row')}>
          Add row below
        </DropdownListItem>
        <DropdownListItem onClick={action(addColumnLeft, 'insert', 'Column')}>
          Add column left
        </DropdownListItem>
        <DropdownListItem onClick={action(addColumnRight, 'insert', 'Column')}>
          Add column right
        </DropdownListItem>
      </DropdownList>
      <DropdownList border="top">
        <DropdownListItem onClick={action(deleteRow, 'remove', 'Row')}>Delete row</DropdownListItem>
        <DropdownListItem onClick={action(deleteColumn, 'remove', 'Column')}>
          Delete column
        </DropdownListItem>
        <DropdownListItem onClick={action(deleteTable, 'remove', 'Table')}>
          Delete table
        </DropdownListItem>
      </DropdownList>
    </Dropdown>
  );
};
