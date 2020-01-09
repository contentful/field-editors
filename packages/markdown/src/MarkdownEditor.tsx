import React from 'react';
import { css } from 'emotion';
import { isRtlLang } from 'rtl-detect';
import tokens from '@contentful/forma-36-tokens';
import { FieldConnector } from '@contentful/field-editor-shared';
import { FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import { MarkdownTabs } from './components/MarkdownTabs';
import { MarkdownToolbar } from './components/MarkdownToolbar';
import { MarkdownTextarea } from './components/MarkdownTextarea/MarkdownTextarea';
import { InitializedEditorType } from './components/MarkdownTextarea/MarkdownTextarea';
import { MarkdownBottomBar, MarkdownHelp } from './components/MarkdownBottomBar';
import { MarkdownTab } from './types';
import { openCheatsheetModal } from './dialogs/CheatsheetModalDialog';
import { MarkdownPreview } from './components/MarkdownPreview/MarkdownPreview';
import { MarkdownConstraints } from './components/MarkdownConstraints';
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
  const direction = isRtlLang(props.sdk.field.locale) ? 'rtl' : 'ltr';

  return (
    <div className={styles.container} data-test-id="markdown-editor">
      <MarkdownTabs
        active={selectedTab}
        onSelect={tab => {
          setSelectedTab(tab);
        }}
      />
      <MarkdownToolbar
        mode="default"
        disabled={isActionDisabled}
        canUploadAssets={props.parameters.instance.canUploadAssets}
        actions={createMarkdownActions({ sdk: props.sdk, editor, locale: props.sdk.field.locale })}
      />
      <MarkdownTextarea
        mode="default"
        visible={selectedTab === 'editor'}
        disabled={isActionDisabled}
        direction={direction}
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
      {selectedTab === 'preview' && (
        <MarkdownPreview direction={direction} mode="default" value={currentValue} />
      )}
      <MarkdownBottomBar>
        <MarkdownHelp
          onClick={() => {
            openCheatsheetModal(props.sdk.dialogs);
          }}
        />
      </MarkdownBottomBar>
      <MarkdownConstraints sdk={props.sdk} value={currentValue} />
    </div>
  );
}

export function MarkdownEditorConnected(props: MarkdownEditorProps) {
  return (
    <FieldConnector<string>
      throttle={300}
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
