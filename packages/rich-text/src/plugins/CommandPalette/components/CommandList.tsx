import * as React from 'react';

import { Popover, Stack, SectionHeading, ScreenReaderOnly, Flex } from '@contentful/f36-components';
import { PlateEditor } from '@udecode/plate-core';
import { cx } from 'emotion';
import isHotkey from 'is-hotkey';

import { useSdkContext } from '../../../SdkProvider';
import { useCommands } from '../useCommands';
import styles from './CommandList.styles';

export interface CommandListProps {
  query: string;
  editor: PlateEditor;
}

export const useCommandList = (commandItems, container) => {
  const firstUpdate = React.useRef(true);
  const [selectedItem, setSelectedItem] = React.useState<string>(() => {
    // select the first item on initial render
    if ('group' in commandItems[0]) {
      return commandItems[0].commands[0].id;
    }
    return commandItems[0].id;
  });

  // after the command list changes, select the first item
  React.useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    if (commandItems.length === 0) {
      return;
    }
    if ('group' in commandItems[0]) {
      setSelectedItem(commandItems[0].commands[0].id);
    }
    setSelectedItem(commandItems[0].id);
  }, [commandItems]);

  React.useEffect(() => {
    if (!container || !container.current) {
      return;
    }
    const buttons = Array.from(container.current.querySelectorAll('button')) as HTMLButtonElement[];
    const currBtn = buttons.find((btn) => btn.id === selectedItem);
    const currIndex = currBtn ? buttons.indexOf(currBtn) : 0;

    function handleKeyDown(event: KeyboardEvent) {
      if (isHotkey('up', event)) {
        if (currIndex === 0) {
          return;
        }
        setSelectedItem(buttons[currIndex - 1].id);
        buttons[currIndex - 1].scrollIntoView({
          block: 'nearest',
          inline: 'start',
        });
      }
      if (isHotkey('down', event)) {
        if (currIndex === buttons.length - 1) {
          return;
        }
        setSelectedItem(buttons[currIndex + 1].id);
        buttons[currIndex + 1].scrollIntoView({
          block: 'nearest',
          inline: 'start',
        });
      }
      if (isHotkey('enter', event)) {
        if (currBtn) {
          currBtn.click();
        }
      }
    }

    if (commandItems.length) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandItems, container, selectedItem]);

  return {
    selectedItem,
  };
};

export const CommandList = ({ query, editor }: CommandListProps) => {
  const sdk = useSdkContext();
  const container = React.useRef<HTMLDivElement>(null);
  const commandItems = useCommands(sdk, query, editor);
  const { selectedItem } = useCommandList(commandItems, container);

  if (commandItems.length === 0) {
    return null;
  }

  return (
    <div className={styles.container} tabIndex={-1} ref={container}>
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
          {/* TODO - show the label here and not the id */}
          Richtext commands. Currently focused item: {selectedItem}. Press <kbd>enter</kbd> to
          select, <kbd>arrows</kbd> to navigate, <kbd>escape</kbd> to close.
        </ScreenReaderOnly>
      </div>
      <div aria-hidden={true}>
        {/* eslint-disable-next-line jsx-a11y/no-autofocus -- we want to keep focus on text input*/}
        <Popover isOpen={true} usePortal={false} autoFocus={false}>
          {/* we need an empty trigger here for the positioning of the menu list */}
          <Popover.Trigger>
            <span />
          </Popover.Trigger>
          <Popover.Content className={styles.menuContent}>
            <header className={styles.menuHeader}>
              <SectionHeading marginBottom="none">Richtext commands</SectionHeading>
            </header>
            <div className={styles.menuList}>
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
                ) : item.callback ? (
                  <button
                    key={item.id}
                    id={item.id}
                    className={cx(styles.menuItem, {
                      [styles.menuItemSelected]: item.id === selectedItem,
                    })}
                    onClick={item.callback}>
                    <Flex alignItems="center" gap="spacingS">
                      {item.thumbnail && (
                        <img
                          width="30"
                          height="30"
                          src={item.thumbnail}
                          alt=""
                          className={styles.thumbnail}
                        />
                      )}
                      <span>{item.label}</span>
                    </Flex>
                  </button>
                ) : (
                  <button key={item.id} id={item.id} className={styles.menuItem}>
                    {item.label}
                  </button>
                );
              })}
            </div>
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