import React from 'react';
import { css } from 'emotion';
import { FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import { MarkdownTabs } from './components/MarkdownTabs';
import { MarkdownToolbar } from './components/MarkdownToolbar';
import { MarkdownTextarea } from './components/MarkdownTextarea/index';
import { MarkdownBottomBar, MarkdownHelp, MarkdownCounter } from './components/MarkdownBottomBar';
import { MarkdownTab } from './types';
import { openCheatsheetModal } from './CheatsheetModalContent';

const styles = {
  container: css({
    display: 'flex',
    flexDirection: 'column'
  })
};

export interface MarkdownEditorProps {
  sdk: FieldExtensionSDK;
}

export function MarkdownEditor(props: MarkdownEditorProps) {
  const [value, setValue] = React.useState<string>('');
  const [selectedTab, setSelectedTab] = React.useState<MarkdownTab>('editor');

  return (
    <div className={styles.container}>
      <MarkdownTabs
        active={selectedTab}
        onSelect={tab => {
          setSelectedTab(tab);
        }}
      />
      <MarkdownToolbar
        disabled={selectedTab !== 'editor'}
        actions={{
          linkExistingMedia: () => {
            props.sdk.dialogs.selectMultipleAssets();
          }
        }}
      />
      <MarkdownTextarea value={value} onChange={value => setValue(value)} isDisabled={false} />
      <MarkdownBottomBar>
        <MarkdownHelp
          onClick={() => {
            openCheatsheetModal(props.sdk);
          }}
        />
        <MarkdownCounter words={0} characters={0} />
      </MarkdownBottomBar>
    </div>
  );
}
