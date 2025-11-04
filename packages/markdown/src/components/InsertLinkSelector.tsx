import * as React from 'react';

import { Button, Menu } from '@contentful/f36-components';
import { ImageSquareIcon, CaretDownIcon } from '@contentful/f36-icons';

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
        startIcon={<ImageSquareIcon />}
        testId="markdownEditor.linkExistingAssets"
        size="small"
        variant="secondary"
        onClick={() => {
          props.onSelectExisting();
        }}
      >
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
          endIcon={<CaretDownIcon />}
          isDisabled={props.disabled}
          startIcon={<ImageSquareIcon />}
          testId="markdownEditor.insertMediaDropdownTrigger"
          size="small"
          variant="secondary"
        >
          Insert media
        </Button>
      </Menu.Trigger>
      <Menu.List>
        <Menu.Item testId="markdownEditor.uploadAssetsAndLink" onClick={() => props.onAddNew()}>
          Add new media and link
        </Menu.Item>
        <Menu.Item
          testId="markdownEditor.linkExistingAssets"
          onClick={() => props.onSelectExisting()}
        >
          Link existing media
        </Menu.Item>
      </Menu.List>
    </Menu>
  );
};
