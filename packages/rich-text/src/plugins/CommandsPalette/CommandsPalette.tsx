import * as React from 'react';

import { Stack, Menu, SectionHeading } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { PlateRenderLeafProps } from '@udecode/plate-core';
import { css } from 'emotion';
import { useRichTextCommands } from './useRichTextCommands';
import { useSdkContext } from '../../SdkProvider';

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
  menu: css({
    position: 'absolute',
  }),
};

export const CommandsPalette = (props: PlateRenderLeafProps) => {
  const commandItems = useRichTextCommands(useSdkContext(), props.text.text.slice(1));
  console.log(commandItems);

  // Error: Cannot resolve a DOM point from Slate point
  // const point = { path: [0, 0], offset: 0 };
  // props.editor.selection = { anchor: point, focus: point };

  return (
    <span {...props.attributes}>
      {props.children}
      <div className={styles.menu}>
        <Menu defaultIsOpen>
          {/* we need an empty trigger here for the positioning of the menu list */}
          <Menu.Trigger>
            <span />
          </Menu.Trigger>
          <Menu.List className={styles.menuList}>
            <Menu.ListHeader className={styles.menuBar}>
              <SectionHeading marginBottom="none">Richtext commands</SectionHeading>
            </Menu.ListHeader>

            {commandItems.map((item) => {
              return 'group' in item ? (
                <section key={item.group}>
                  <SectionHeading
                    as="h3"
                    marginBottom="spacingS"
                    marginTop="spacingS"
                    marginLeft="spacingM"
                    marginRight="spacingM">
                    {item.group}
                  </SectionHeading>
                  {item.commands.map((command) => (
                    <Menu.Item onClick={command.callback} key={command.label}>
                      {command.label}
                    </Menu.Item>
                  ))}
                  <Menu.Divider role="separator" />
                </section>
              ) : (
                <Menu.Item onClick={item.callback}>{item.label}</Menu.Item>
              );
            })}
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
      </div>
    </span>
  );
};
