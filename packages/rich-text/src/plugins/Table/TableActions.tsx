import React from 'react';
import { css } from 'emotion';
import * as Slate from 'slate-react';
import {
  PlateEditor,
  TablePluginOptions,
  deleteColumn,
  deleteRow,
  deleteTable,
  getAbove,
} from '@udecode/plate';
import { IconButton, Menu } from '@contentful/f36-components';
import { ChevronDownIcon } from '@contentful/f36-icons';
import { BLOCKS } from '@contentful/rich-text-types';

import { isTableHeaderEnabled } from './helpers';
import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { getNodeEntryFromSelection, getTableSize } from '../../helpers/editor';
import { RichTextTrackingActionName, useTrackingContext } from '../../TrackingProvider';
import { addRowAbove, addColumnLeft, addColumnRight, addRowBelow, setHeader } from './actions';

export const styles = {
  topRight: css({
    position: 'absolute',
    top: '6px',
    right: '5px',
  }),
};

const getCurrentTableSize = (
  editor: PlateEditor
): Record<'numRows' | 'numColumns', number> | null => {
  const [table] = getNodeEntryFromSelection(editor, BLOCKS.TABLE);
  return table ? getTableSize(table) : null;
};

type TableAction = (editor: PlateEditor, options: TablePluginOptions) => void;

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
    setHeaderEnabled(Boolean(editor && isTableHeaderEnabled(editor)));
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
    <Menu
      placement="left"
      isOpen={isOpen}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={close}>
      <Menu.Trigger>
        <IconButton
          size="small"
          variant="transparent"
          tabIndex={-1}
          className={styles.topRight}
          icon={<ChevronDownIcon />}
          aria-label="Open table menu"
          testId="cf-table-actions-button"
        />
      </Menu.Trigger>
      <Menu.List>
        <Menu.Item onClick={action(addRowAbove, 'insert', 'Row')} disabled={!canInsertRowAbove}>
          Add row above
        </Menu.Item>
        <Menu.Item onClick={action(addRowBelow, 'insert', 'Row')}>Add row below</Menu.Item>
        <Menu.Item onClick={action(addColumnLeft, 'insert', 'Column')}>Add column left</Menu.Item>
        <Menu.Item onClick={action(addColumnRight, 'insert', 'Column')}>Add column right</Menu.Item>
        <Menu.Divider />
        <Menu.Item onClick={toggleHeader}>
          {isHeaderEnabled ? 'Disable table header' : 'Enable table header'}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item onClick={action(deleteRow, 'remove', 'Row')}>Delete row</Menu.Item>
        <Menu.Item onClick={action(deleteColumn, 'remove', 'Column')}>Delete column</Menu.Item>
        <Menu.Item onClick={action(deleteTable, 'remove', 'Table')}>Delete table</Menu.Item>
      </Menu.List>
    </Menu>
  );
};
