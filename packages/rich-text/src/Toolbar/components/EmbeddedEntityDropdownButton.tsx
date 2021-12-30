import * as React from 'react';

import { Button, Menu } from '@contentful/f36-components';
import { PlusIcon, ChevronDownIcon } from '@contentful/f36-icons';

export interface EmbeddedEntityDropdownButtonProps {
  children: React.ReactNode;
  isDisabled: boolean | undefined;
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export function EmbeddedEntityDropdownButton({
  children,
  isDisabled,
  isOpen,
  onClose,
  onToggle,
}: EmbeddedEntityDropdownButtonProps) {
  return (
    <Menu placement="bottom-end" isOpen={isOpen} onClose={onClose} onOpen={onToggle}>
      <Menu.Trigger>
        <Button
          endIcon={<ChevronDownIcon />}
          testId="toolbar-entity-dropdown-toggle"
          variant="secondary"
          size="small"
          startIcon={<PlusIcon />}
          isDisabled={isDisabled}>
          Embed
        </Button>
      </Menu.Trigger>
      <Menu.List className="toolbar-entity-dropdown-list">{children}</Menu.List>
    </Menu>
  );
}
