import React from 'react';
import { Menu } from '@contentful/f36-components';

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
  return (
    <Menu placement="bottom-end">
      <Menu.Trigger>
        <Button
          endIcon={<ChevronDownIcon />}
          isDisabled={props.disabled}
          startIcon={<AssetIcon />}
          testId="markdownEditor.insertMediaDropdownTrigger"
          size="small"
          variant="secondary">
          Insert media
        </Button>
      </Menu.Trigger>
      <Menu.List>
        <Menu.Item testId="markdownEditor.uploadAssetsAndLink" onClick={() => props.onAddNew()}>
          Add new media and link
        </Menu.Item>
        <Menu.Item
          testId="markdownEditor.linkExistingAssets"
          onClick={() => props.onSelectExisting()}>
          Link existing media
        </Menu.Item>
      </Menu.List>
    </Menu>
  );
};
