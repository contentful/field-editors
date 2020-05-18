import React, { useState } from 'react';
import {
  Button,
  Dropdown,
  DropdownList,
  DropdownListItem,
} from '@contentful/forma-36-react-components';

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
        disabled={props.disabled}
        icon="Asset"
        testId="markdownEditor.linkExistingAssets"
        size="small"
        buttonType="muted"
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
          disabled={props.disabled}
          icon="Asset"
          testId="markdownEditor.insertMediaDropdownTrigger"
          size="small"
          buttonType="muted"
          indicateDropdown
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
