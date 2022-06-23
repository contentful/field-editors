import * as React from 'react';

import { Stack, Menu, SectionHeading } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';

import { useSdkContext } from '../../../SdkProvider';
import { useCommands } from '../useCommands';

const styles = {
  container: css({
    position: 'absolute',
  }),
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

export interface CommandListProps {
  query: string;
}

export const CommandList = ({ query }: CommandListProps) => {
  const sdk = useSdkContext();
  const commandItems = useCommands(sdk, query);

  //if commandItems changes (e.g. we open the assets group), then focus on first item
  const container = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!container || !container.current) {
      return;
    }
    const firstFocusableEl = container.current.firstChild as HTMLElement | null;
    firstFocusableEl?.focus();
  }, [commandItems]);

  if (commandItems.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Menu isOpen={true}>
        {/* we need an empty trigger here for the positioning of the menu list */}
        <Menu.Trigger>
          <span />
        </Menu.Trigger>
        <Menu.List className={styles.menuList}>
          <Menu.ListHeader className={styles.menuBar}>
            <SectionHeading marginBottom="none">Richtext commands</SectionHeading>
          </Menu.ListHeader>

          <div ref={container}>
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
          </div>
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
  );
};
