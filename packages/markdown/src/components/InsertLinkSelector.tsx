import React, { useState } from 'react';
import { Dropdown, DropdownList, DropdownListItem } from '@contentful/forma-36-react-components';

import { Button } from '@contentful/f36-components';

import { AssetIcon, ChevronDownIcon } from '@contentful/f36-icons';

interface InsertLinkSelectorProps {
  onSelectExisting: Function;
  onAddNew: Function;
  canAddNew: boolean;
  disabled: boolean;
}

export const InsertLinkSelector = (props: InsertLinkSelectorProps) => {
  if (props.canAddNew) {
    return <MultipleMediaContextMenu {...props} />;
  } else {
    return (
      <Button
        isDisabled={props.disabled}
        startIcon={<AssetIcon />}
        testId="markdownEditor.linkExistingAssets"
        size="small"
        variant="secondary"
        onClick={() => {
          props.onSelectExisting();
        }}>
        Insert media
      </Button>
    );
  }
};

const MultipleMediaContextMenu = (props: InsertLinkSelectorProps) => {
  const [isOpen, setOpen] = useState(false);
  const handleMenuClick = (fn: Function) => {
    fn();
    setOpen(false);
  };
  return (
    <Dropdown
      isOpen={isOpen}
      position="bottom-right"
      onClose={() => setOpen(false)}
      toggleElement={
        <Button
          endIcon={<ChevronDownIcon />}
          isDisabled={props.disabled}
          startIcon={<AssetIcon />}
          testId="markdownEditor.insertMediaDropdownTrigger"
          size="small"
          variant="secondary"
          onClick={() => setOpen(!isOpen)}>
          Insert media
        </Button>
      }>
      <DropdownList>
        <DropdownListItem
          testId="markdownEditor.uploadAssetsAndLink"
          onClick={() => handleMenuClick(props.onAddNew)}>
          Add new media and link
        </DropdownListItem>
        <DropdownListItem
          testId="markdownEditor.linkExistingAssets"
          onClick={() => handleMenuClick(props.onSelectExisting)}>
          Link existing media
        </DropdownListItem>
      </DropdownList>
    </Dropdown>
  );
};
