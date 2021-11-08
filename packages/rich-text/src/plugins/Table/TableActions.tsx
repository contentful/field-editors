import React from 'react';
import { css } from 'emotion';
import * as Slate from 'slate-react';
import tokens from '@contentful/f36-tokens';
import { SPEditor } from '@udecode/plate-core';
import { TablePluginOptions, deleteColumn, deleteRow, deleteTable } from '@udecode/plate-table';
import {
  IconButton,
  Dropdown,
  DropdownList,
  DropdownListItem,
} from '@contentful/forma-36-react-components';
import { getAbove } from '@udecode/plate-common';
import { BLOCKS } from '@contentful/rich-text-types';

import { isTableHeaderEnabled } from './helpers';
import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { getNodeEntryFromSelection, getTableSize } from '../../helpers/editor';
import { RichTextTrackingActionName, useTrackingContext } from '../../TrackingProvider';
import { addRowAbove, addColumnLeft, addColumnRight, addRowBelow, setHeader } from './actions';

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
  const [isHeaderEnabled, setHeaderEnabled] = React.useState(false);

  const close = React.useCallback(() => {
    setOpen(false);

    if (!editor) return;

    // Makes sure we keep the editor in focus when clicking on/out
    // the dropdown menu
    Slate.ReactEditor.focus(editor);
  }, [editor]);

  React.useEffect(() => {
    setHeaderEnabled(editor && isTableHeaderEnabled(editor));
  }, [editor]);

  const canInsertRowAbove = React.useMemo(() => {
    if (!editor) {
      return false;
    }

    const headerCell = getAbove(editor, {
      match: {
        type: BLOCKS.TABLE_HEADER_CELL,
      },
    });

    return !headerCell;
  }, [editor]);

  const toggleHeader = React.useCallback(() => {
    close();

    if (!editor) {
      return;
    }

    const value = !isHeaderEnabled;

    setHeaderEnabled(value);
    setHeader(editor, value);
  }, [editor, close, isHeaderEnabled]);

  const action = React.useCallback(
    (cb: TableAction, type: 'insert' | 'remove', element: 'Table' | 'Row' | 'Column') => () => {
      if (!editor?.selection) return;
      close();

      const tableSize = getCurrentTableSize(editor);

      cb(editor, { header: isHeaderEnabled });

      // Tracking
      const actionName = `${type}Table${element === 'Table' ? '' : element}`;
      onViewportAction(actionName as RichTextTrackingActionName, { tableSize });
    },
    [editor, isHeaderEnabled, close, onViewportAction]
  );

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
        <DropdownListItem
          onClick={action(addRowAbove, 'insert', 'Row')}
          isDisabled={!canInsertRowAbove}>
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
        <DropdownListItem onClick={toggleHeader}>
          {isHeaderEnabled ? 'Disable table header' : 'Enable table header'}
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
