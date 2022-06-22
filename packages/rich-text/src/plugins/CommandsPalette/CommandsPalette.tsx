import * as React from 'react';

import { Stack, Menu, SectionHeading } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { PlateRenderLeafProps } from '@udecode/plate-core';
import { css } from 'emotion';

const styles = {
  menuList: css({
    width: '400px',
    maxHeight: '300px',
    overflow: 'auto',
  }),
  menuBar: css({
    backgroundColor: tokens.gray100,
    padding: tokens.spacingM,
  }),
  footerList: css({
    listStyle: 'none',
    color: tokens.gray600,
  }),
};

const contentTypes = [
  {
    name: 'Example content type',
  },
  {
    name: 'Another Content Type',
  },
];

export const CommandsPalette = (props: PlateRenderLeafProps) => {
  console.log(props);

  // Error: Cannot resolve a DOM point from Slate point
  const point = { path: [0, 0], offset: 0 };
  props.editor.selection = { anchor: point, focus: point };

  return (
    <Menu defaultIsOpen>
      {/* we need an empty trigger here for the positioning of the menu list */}
      <Menu.Trigger>
        <span />
      </Menu.Trigger>
      <Menu.List className={styles.menuList}>
        <Menu.ListHeader className={styles.menuBar}>
          <SectionHeading marginBottom="none">Richtext commands</SectionHeading>
        </Menu.ListHeader>

        {contentTypes.map(({ name }) => (
          <section key={name}>
            <SectionHeading
              as="h3"
              marginBottom="spacingS"
              marginTop="spacingS"
              marginLeft="spacingM"
              marginRight="spacingM">
              {name}
            </SectionHeading>
            <Menu.Item>Embed {name}</Menu.Item>
            <Menu.Item>Embed {name} - inline</Menu.Item>
            <Menu.Divider role="separator" />
          </section>
        ))}
        <section>
          <SectionHeading
            as="h3"
            marginBottom="spacingS"
            marginTop="spacingS"
            marginLeft="spacingM"
            marginRight="spacingM">
            Assets
          </SectionHeading>
          <Menu.Item>Embed asset</Menu.Item>
        </section>
        <Menu.ListFooter className={styles.menuBar}>
          <Stack
            as="ul"
            margin="none"
            padding="none"
            spacing="spacingS"
            className={styles.footerList}>
            <li>
              <kbd>↑</kbd>
              <kbd>↓</kbd> to navigate
            </li>
            <li>
              <kbd>↵</kbd> to confirm
            </li>
            <li>
              <kbd>esc</kbd> to close
            </li>
          </Stack>
        </Menu.ListFooter>
      </Menu.List>
    </Menu>
  );
};
