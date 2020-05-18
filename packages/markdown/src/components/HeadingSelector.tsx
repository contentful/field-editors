import React, { useState } from 'react';
import { Dropdown, DropdownList, DropdownListItem } from '@contentful/forma-36-react-components';
import { HeadingType } from '../types';

export const HeadingSelector = (props: {
  children: React.ReactElement;
  onSelect: (heading: HeadingType) => void;
}) => {
  const [isOpen, setOpen] = useState(false);
  const handleMenuClick = (heading: HeadingType) => {
    props.onSelect(heading);
    setOpen(false);
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      toggleElement={React.cloneElement(props.children, {
        onClick: () => setOpen(!isOpen),
      })}>
      <DropdownList>
        <DropdownListItem
          testId="markdown-action-button-heading-h1"
          onClick={() => handleMenuClick('h1')}>
          Heading 1
        </DropdownListItem>
        <DropdownListItem
          testId="markdown-action-button-heading-h2"
          onClick={() => handleMenuClick('h2')}>
          Heading 2
        </DropdownListItem>
        <DropdownListItem
          testId="markdown-action-button-heading-h3"
          onClick={() => handleMenuClick('h3')}>
          Heading 3
        </DropdownListItem>
      </DropdownList>
    </Dropdown>
  );
};
