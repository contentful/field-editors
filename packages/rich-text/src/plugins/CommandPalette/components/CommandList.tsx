import * as React from 'react';
import { usePopper } from 'react-popper';

import {
  Popover,
  Stack,
  SectionHeading,
  ScreenReaderOnly,
  Flex,
  AssetIcon,
} from '@contentful/f36-components';
import { Portal } from '@contentful/f36-utils';
import { SharedQueryClientProvider } from '@contentful/field-editor-shared/react-query';
import { cx } from 'emotion';

import { PlateEditor } from '../../../internal/types';
import { useSdkContext } from '../../../SdkProvider';
import { useCommandList } from '../hooks/useCommandList';
import { CommandList as CommandItems, Command, useCommands, CommandGroup } from '../useCommands';
import styles from './CommandList.styles';

export interface CommandListProps {
  query: string;
  editor: PlateEditor;
  textContainer?: HTMLSpanElement;
}

const Group = ({
  commandGroup,
  selectedItem,
}: {
  commandGroup: CommandGroup;
  selectedItem: string;
}) => (
  <section key={commandGroup.group}>
    <SectionHeading
      as="h3"
      marginBottom="spacingS"
      marginTop="spacingS"
      marginLeft="spacingM"
      marginRight="spacingM"
    >
      {commandGroup.group}
    </SectionHeading>
    {commandGroup.commands.map((command: Command) => (
      <button
        key={command.id}
        id={command.id}
        className={cx(styles.menuItem, {
          [styles.menuItemSelected]: command.id === selectedItem,
        })}
        onClick={command.callback}
      >
        {command.label}
      </button>
    ))}
    <hr className={styles.menuDivider} aria-orientation="horizontal" />
  </section>
);

const Asset = ({ command, selectedItem }: { command: Command; selectedItem: string }) => (
  <button
    key={command.id}
    id={command.id}
    className={cx(styles.menuItem, {
      [styles.menuItemSelected]: command.id === selectedItem,
    })}
    onClick={command.callback}
  >
    <Flex alignItems="center" gap="spacingS">
      {command.thumbnail ? (
        <img width="30" height="30" src={command.thumbnail} alt="" className={styles.thumbnail} />
      ) : (
        <AssetIcon width="30" height="30" className={styles.thumbnail} />
      )}
      <span>{command.label}</span>
    </Flex>
  </button>
);

const Item = ({ command, selectedItem }: { command: Command; selectedItem: string }) => (
  <button
    key={command.id}
    id={command.id}
    className={cx(styles.menuItem, {
      [styles.menuItemSelected]: command.id === selectedItem,
    })}
    onClick={command.callback}
  >
    {command.label}
  </button>
);

const CommandListItems = ({
  commandItems,
  selectedItem,
}: {
  commandItems: CommandItems;
  selectedItem: string;
}) => {
  return (
    <>
      {commandItems.map((command) => {
        return 'group' in command ? (
          <Group key={command.group} commandGroup={command} selectedItem={selectedItem} />
        ) : command.asset ? (
          <Asset key={command.id} command={command} selectedItem={selectedItem} />
        ) : (
          <Item key={command.id} command={command} selectedItem={selectedItem} />
        );
      })}
    </>
  );
};

const InternalCommandList = ({ query, editor, textContainer }: CommandListProps) => {
  const sdk = useSdkContext();
  const popoverContainer = React.useRef<HTMLDivElement>(null);
  const popper = usePopper(textContainer, popoverContainer?.current, {
    placement: 'bottom-start',
  });
  const commandItems = useCommands(sdk, query, editor);
  const { selectedItem, isOpen } = useCommandList(commandItems, popoverContainer);

  if (!commandItems.length) {
    return null;
  }

  return (
    <div className={styles.container} tabIndex={-1} contentEditable={false}>
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
      <Portal>
        <div
          aria-hidden={true}
          ref={popoverContainer}
          className={styles.menuPoper}
          style={popper.styles.popper}
          {...popper.attributes.popper}
        >
          <Popover
            isOpen={isOpen}
            usePortal={false}
            /* eslint-disable-next-line jsx-a11y/no-autofocus -- we want to keep focus on text input*/
            autoFocus={false}
          >
            {/* we need an empty trigger here for the positioning of the menu list */}
            <Popover.Trigger>
              <span />
            </Popover.Trigger>
            <Popover.Content className={styles.menuContent} testId="rich-text-commands">
              <header className={styles.menuHeader}>
                <SectionHeading marginBottom="none">Richtext commands</SectionHeading>
              </header>
              <div className={styles.menuList} data-test-id="rich-text-commands-list">
                <CommandListItems commandItems={commandItems} selectedItem={selectedItem} />
              </div>
              <footer className={styles.menuFooter}>
                <Stack
                  as="ul"
                  margin="none"
                  padding="none"
                  spacing="spacingS"
                  className={styles.footerList}
                >
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
      </Portal>
    </div>
  );
};

export const CommandList = ({ query, editor, textContainer }: CommandListProps) => {
  return (
    <SharedQueryClientProvider>
      <InternalCommandList query={query} editor={editor} textContainer={textContainer} />
    </SharedQueryClientProvider>
  );
};
