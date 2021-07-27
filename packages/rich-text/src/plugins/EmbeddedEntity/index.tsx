import * as React from 'react';
import { Dropdown, DropdownList, Button } from '@contentful/forma-36-react-components';

interface EmbeddedEntityDropdownButtonProps {
  children: React.ReactNode[];
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
    <Dropdown
      className="toolbar-entry-dropdown"
      position="bottom-right"
      toggleElement={
        <Button
          onClick={onToggle}
          data-test-id="toolbar-entity-dropdown-toggle"
          indicateDropdown
          buttonType="muted"
          size="small"
          icon="Plus"
          disabled={isDisabled}>
          Embed
        </Button>
      }
      isOpen={isOpen}
      onClose={onClose}>
      <DropdownList>{children}</DropdownList>
    </Dropdown>
  );
}
