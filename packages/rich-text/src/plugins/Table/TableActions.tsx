import React from 'react';
import { css } from 'emotion';
import * as Slate from 'slate-react';
import tokens from '@contentful/forma-36-tokens';
import { SPEditor, useStoreEditor } from '@udecode/slate-plugins-core';
import {
  TablePluginOptions,
  deleteColumn,
  deleteRow,
  deleteTable,
} from '@udecode/slate-plugins-table';
import {
  IconButton,
  Dropdown,
  DropdownList,
  DropdownListItem,
} from '@contentful/forma-36-react-components';

import { addRowAbove, addColumnLeft, addColumnRight, addRowBelow } from './actions';

export const styles = {
  topRight: css({
    position: 'absolute',
    top: tokens.spacingXs,
    right: tokens.spacingXs,
  }),
};

type TableAction = (editor: SPEditor, options: TablePluginOptions) => void;

export const TableActions = () => {
  const editor = useStoreEditor();
  const [isOpen, setOpen] = React.useState(false);

  const close = () => {
    setOpen(false);

    if (!editor) return;

    // Makes sure we keep the editor in focus when clicking on/out
    // the dropdown menu
    Slate.ReactEditor.focus(editor);
  };

  const action = (cb: TableAction) => () => {
    if (!editor) return;

    close();
    cb(editor, {});
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
        />
      }>
      <DropdownList>
        <DropdownListItem onClick={action(addRowAbove)}>Add row above</DropdownListItem>
        <DropdownListItem onClick={action(addRowBelow)}>Add row below</DropdownListItem>
        <DropdownListItem onClick={action(addColumnLeft)}>Add column left</DropdownListItem>
        <DropdownListItem onClick={action(addColumnRight)}>Add column right</DropdownListItem>
      </DropdownList>
      <DropdownList border="top">
        <DropdownListItem onClick={action(deleteRow)}>Delete row</DropdownListItem>
        <DropdownListItem onClick={action(deleteColumn)}>Delete column</DropdownListItem>
        <DropdownListItem onClick={action(deleteTable)}>Delete table</DropdownListItem>
      </DropdownList>
    </Dropdown>
  );
};
