import * as React from 'react';

import { Popover, Stack, SectionHeading, ScreenReaderOnly, Flex } from '@contentful/f36-components';
import { PlateEditor } from '@udecode/plate-core';
import { cx } from 'emotion';

import { useSdkContext } from '../../../SdkProvider';
import { useCommandList } from '../hooks/useCommandList';
import { CommandList as CommandItems, useCommands } from '../useCommands';
import styles from './CommandList.styles';

export interface CommandListProps {
  query: string;
  editor: PlateEditor;
}

const CommandListItems = ({
  commandItems,
  selectedItem,
}: {
  commandItems: CommandItems;
  selectedItem: string;
}) => {
  const group = (command) => {
    return (
      <section key={command.group}>
        <SectionHeading
          as="h3"
          marginBottom="spacingS"
          marginTop="spacingS"
          marginLeft="spacingM"
          marginRight="spacingM">
          {command.group}
        </SectionHeading>
        {command.commands.map((command) => (
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
    );
  };

  const asset = (command) => {
    return (
      <button
        key={command.id}
        id={command.id}
        className={cx(styles.menuItem, {
          [styles.menuItemSelected]: command.id === selectedItem,
        })}
        onClick={command.callback}>
        <Flex alignItems="center" gap="spacingS">
          {command.thumbnail && (
            <img
              width="30"
              height="30"
              src={command.thumbnail}
              alt=""
              className={styles.thumbnail}
            />
          )}
          <span>{command.label}</span>
        </Flex>
      </button>
    );
  };

  const item = (command) => {
    return (
      <button key={command.id} id={command.id} className={styles.menuItem}>
        {command.label}
      </button>
    );
  };

  return (
    <>
      {commandItems.map((command) => {
        return 'group' in command
          ? group(command)
          : command.callback
          ? asset(command)
          : item(command);
      })}
    </>
  );
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
    <div className={styles.container} tabIndex={-1} ref={container} contentEditable={false}>
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
              <CommandListItems commandItems={commandItems} selectedItem={selectedItem} />
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
