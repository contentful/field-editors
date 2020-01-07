import React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { FieldConnector } from '@contentful/field-editor-shared';
import { FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import { MarkdownTabs } from './components/MarkdownTabs';
import { MarkdownToolbar } from './components/MarkdownToolbar';
import { MarkdownTextarea } from './components/MarkdownTextarea/MarkdownTextarea';
import { InitializedEditorType } from './components/MarkdownTextarea/MarkdownTextarea';
import { MarkdownBottomBar, MarkdownHelp, MarkdownCounter } from './components/MarkdownBottomBar';
import { MarkdownTab } from './types';
import { openCheatsheetModal } from './dialogs/CheatsheetModalDialog';
import { MarkdownPreview } from './components/MarkdownPreview/MarkdownPreview';
import { createMarkdownActions } from './MarkdownActions';

const styles = {
  container: css({
    display: 'flex',
    flexDirection: 'column',
    fontFamily: tokens.fontStackPrimary
  })
};

export interface MarkdownEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;
  sdk: FieldExtensionSDK;
  parameters: {
    instance: {
      canUploadAssets: boolean;
    };
  };
  onReady?: Function;
}

export function MarkdownEditor(props: MarkdownEditorProps) {
  const [selectedTab, setSelectedTab] = React.useState<MarkdownTab>('editor');
  const [editor, setEditor] = React.useState<InitializedEditorType | null>(null);

  React.useEffect(() => {
    if (editor && props.onReady) {
      props.onReady(editor);
    }
  }, [editor]);

  return (
    <FieldConnector<string> field={props.sdk.field} isInitiallyDisabled={props.isInitiallyDisabled}>
      {({ value, disabled }) => {
        const isActionDisabled = editor === null || disabled || selectedTab !== 'editor';

        return (
          <div className={styles.container} data-test-id="markdown-editor">
            <MarkdownTabs
              active={selectedTab}
              onSelect={tab => {
                setSelectedTab(tab);
              }}
            />
            <MarkdownToolbar
              disabled={isActionDisabled}
              canUploadAssets={props.parameters.instance.canUploadAssets}
              actions={createMarkdownActions(props.sdk, editor)}
            />
            <MarkdownTextarea
              visible={selectedTab === 'editor'}
              disabled={isActionDisabled}
              direction="ltr"
              onReady={editor => {
                editor.setContent(value ?? '');
                editor.setReadOnly(false);
                setEditor(editor);
              }}
            />
            {selectedTab === 'preview' && <MarkdownPreview />}
            <MarkdownBottomBar>
              <MarkdownHelp
                onClick={() => {
                  openCheatsheetModal(props.sdk.dialogs);
                }}
              />
              <MarkdownCounter words={0} characters={0} />
            </MarkdownBottomBar>
          </div>
        );
      }}
    </FieldConnector>
  );
}
