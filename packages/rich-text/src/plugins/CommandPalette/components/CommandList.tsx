import * as React from 'react';

import { Popover, Stack, SectionHeading, ScreenReaderOnly } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { css, cx } from 'emotion';
import isHotkey from 'is-hotkey';

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
  menuItem: css({
    display: 'block',
    width: '100%',
    background: 'none',
    border: 0,
    margin: 0,
    outline: 'none',
    fontSize: tokens.fontSizeM,
    lineHeight: tokens.lineHeightM,
    fontWeight: tokens.fontWeightNormal,
    position: 'relative',
    textAlign: 'left',
    padding: `${tokens.spacingXs} ${tokens.spacingM}`,
    wordBreak: 'break-word',
    whiteSpace: 'break-spaces',
    cursor: 'pointer',
    hyphens: 'auto',
    minWidth: '150px',
    textDecoration: 'none',
    color: tokens.gray800,
    '&:hover': {
      backgroundColor: tokens.gray100,
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'auto',
    },
  }),
  menuItemSelected: css({
    boxShadow: `inset ${tokens.glowPrimary}`,
    borderRadius: tokens.borderRadiusMedium,
  }),
  menuDivider: css({
    border: 'none',
    width: '100%',
    height: '1px',
    background: tokens.gray300,
    margin: `${tokens.spacingXs} 0`,
  }),
  menuHeader: css({
    position: 'sticky',
    zIndex: tokens.zIndexDefault,
    top: 0,
    backgroundColor: tokens.gray100,
    padding: tokens.spacingM,
  }),
  menuFooter: css({
    position: 'sticky',
    bottom: 0,
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

  const [selectedItem, setSelectedItem] = React.useState(() => {
    if ('group' in commandItems[0]) {
      return commandItems[0].commands[0].id;
    }
    return commandItems[0].id;
  });

  React.useEffect(() => {
    function handleKeyUp(event) {
      if (isHotkey('up', event)) {
        console.log('mouse up');
      }
      if (isHotkey('down', event)) {
        console.log('mouse down');
      }
    }

    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, []);

  if (commandItems.length === 0) {
    return null;
  }

  console.log(commandItems);

  return (
    <div className={styles.container} tabIndex={-1}>
      {/*
        We have to make it visually appear as if the buttons have focus, because we can not set both the
        focus on the textarea and the focus on the button. In HTML you can only set focus on one element at a time.
        So we have to manually tell the screenreader which item has received focus. The actual code of the
        popover we will hide from the screenreader, since it is not accessibly relevant and to avoid reading
        out everything twice.
        We use role alert here because we want to make the screenreader immediately announce the selected
        button, and also when the "fake focus" changes.
       */}
      <div role="alert">
        <ScreenReaderOnly>
          Richtext commands. Currently focused item: Embed Example content type. Press{' '}
          <kbd>enter</kbd> to select, <kbd>arrows</kbd> to navigate, <kbd>escape</kbd> to close.
        </ScreenReaderOnly>
      </div>
      <div aria-hidden={true}>
        <Popover isOpen={true} usePortal={false} autoFocus={false}>
          {/* we need an empty trigger here for the positioning of the menu list */}
          <Popover.Trigger>
            <span />
          </Popover.Trigger>
          <Popover.Content className={styles.menuList}>
            <header className={styles.menuHeader}>
              <SectionHeading marginBottom="none">Richtext commands</SectionHeading>
            </header>
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
                    <button
                      key={command.id}
                      id={command.id}
                      className={cx(styles.menuItem, {
                        [styles.menuItemSelected]: command.id === selectedItem,
                      })}
                      onClick={command.callback}>
                      {command.label}
                    </button>
                  ))}
                  <hr className={styles.menuDivider} aria-orientation="horizontal" />
                </section>
              ) : (
                <button
                  key={item.id}
                  id={item.id}
                  className={cx(styles.menuItem, {
                    [styles.menuItemSelected]: item.id === selectedItem,
                  })}
                  onClick={item.callback}>
                  {item.label}
                </button>
              );
            })}
            <footer className={styles.menuFooter}>
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
            </footer>
          </Popover.Content>
        </Popover>
      </div>
    </div>
  );
};
