import React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { SPEditor, useStoreEditor } from '@udecode/slate-plugins-core';
import {
  addRow,
  addColumn,
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

import { addRowBefore, addColumnLeft } from './actions';

export const styles = {
  topRight: css({
    position: 'absolute',
    top: tokens.spacingXs,
    right: tokens.spacingXs,
  }),
};

type TableAction = (e: SPEditor, o: TablePluginOptions) => void;

export const TableActionsDropdown = () => {
  const editor = useStoreEditor();
  const [isOpen, setOpen] = React.useState(false);

  const action = (cb: TableAction) => () => {
    setOpen(false);
    if (!editor) return;

    cb(editor, {});
  };

  return (
    <Dropdown
      className={styles.topRight}
      position="left"
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      toggleElement={
        <IconButton
          iconProps={{ icon: 'ChevronDown', size: 'tiny' }}
          onClick={() => setOpen(true)}
        />
      }>
      <DropdownList>
        <DropdownListItem onClick={action(addRowBefore)}>Add row above</DropdownListItem>
        <DropdownListItem onClick={action(addRow)}>Add row below</DropdownListItem>
        <DropdownListItem onClick={action(addColumnLeft)}>Add column left</DropdownListItem>
        <DropdownListItem onClick={action(addColumn)}>Add column right</DropdownListItem>
      </DropdownList>
      <DropdownList border="top">
        <DropdownListItem onClick={action(deleteRow)}>Delete row</DropdownListItem>
        <DropdownListItem onClick={action(deleteColumn)}>Delete column</DropdownListItem>
        <DropdownListItem onClick={action(deleteTable)}>Delete table</DropdownListItem>
      </DropdownList>
    </Dropdown>
  );
};
