import * as React from 'react';

import { Menu } from '@contentful/f36-components';

import { HeadingType } from '../types';

export const HeadingSelector = (props: {
  onSelect: (heading: HeadingType) => void;
  renderTrigger: (props: { isOpen: boolean; onClick: () => void }) => React.ReactElement;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleMenuClick = (heading: HeadingType) => {
    setIsOpen(false);
    props.onSelect(heading);
  };

  return (
    <Menu isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <Menu.Trigger>
        {props.renderTrigger({
          isOpen,
          onClick: () => setIsOpen((current) => !current),
        })}
      </Menu.Trigger>
      <Menu.List>
        <Menu.Item testId="markdown-action-button-heading-h1" onClick={() => handleMenuClick('h1')}>
          Heading 1
        </Menu.Item>
        <Menu.Item testId="markdown-action-button-heading-h2" onClick={() => handleMenuClick('h2')}>
          Heading 2
        </Menu.Item>
        <Menu.Item testId="markdown-action-button-heading-h3" onClick={() => handleMenuClick('h3')}>
          Heading 3
        </Menu.Item>
      </Menu.List>
    </Menu>
  );
};
