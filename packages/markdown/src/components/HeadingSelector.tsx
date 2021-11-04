import React from 'react';
import { Menu } from '@contentful/f36-components';
import { HeadingType } from '../types';

export const HeadingSelector = (props: {
  children: React.ReactElement;
  onSelect: (heading: HeadingType) => void;
  tooltip?: string;
}) => {
  const handleMenuClick = (heading: HeadingType) => {
    props.onSelect(heading);
  };

  return (
    <Menu>
      <Menu.Trigger>{props.children}</Menu.Trigger>
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
