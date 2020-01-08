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
import { wordsCount } from './utils/wordsCount';

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

export function MarkdownEditor(
  props: MarkdownEditorProps & {
    disabled: boolean;
    initialValue: string | null | undefined;
    saveValueToSDK: Function;
  }
) {
  const [currentValue, setCurrentValue] = React.useState<string>(props.initialValue ?? '');
  const [selectedTab, setSelectedTab] = React.useState<MarkdownTab>('editor');
  const [editor, setEditor] = React.useState<InitializedEditorType | null>(null);

  React.useEffect(() => {
    if (editor && props.onReady) {
      props.onReady(editor);
    }
  }, [editor]);

  const isActionDisabled = editor === null || props.disabled || selectedTab !== 'editor';

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
          editor.setContent(props.initialValue ?? '');
          editor.setReadOnly(false);
          setEditor(editor);
          editor.events.onChange((value: string) => {
            props.saveValueToSDK(value);
            setCurrentValue(value);
          });
        }}
      />
      {selectedTab === 'preview' && <MarkdownPreview value={currentValue} />}
      <MarkdownBottomBar>
        <MarkdownHelp
          onClick={() => {
            openCheatsheetModal(props.sdk.dialogs);
          }}
        />
        <MarkdownCounter words={wordsCount(currentValue)} characters={currentValue.length} />
      </MarkdownBottomBar>
    </div>
  );
}

export function MarkdownEditorConnected(props: MarkdownEditorProps) {
  return (
    <FieldConnector<string>
      throttle={100}
      field={props.sdk.field}
      isInitiallyDisabled={props.isInitiallyDisabled}>
      {({ value, disabled, setValue, externalReset }) => {
        // on external change reset component completely and init with initial value again
        return (
          <MarkdownEditor
            {...props}
            key={`markdown-editor-${externalReset}`}
            initialValue={value}
            disabled={disabled}
            saveValueToSDK={setValue}
          />
        );
      }}
    </FieldConnector>
  );
}
