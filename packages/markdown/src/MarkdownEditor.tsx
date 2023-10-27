import * as React from 'react';

import { FieldAppSDK } from '@contentful/app-sdk';
import tokens from '@contentful/f36-tokens';
import { FieldConnector } from '@contentful/field-editor-shared';
import { css } from 'emotion';

import { MarkdownBottomBar, MarkdownHelp } from './components/MarkdownBottomBar.js';
import { MarkdownConstraints } from './components/MarkdownConstraints.js';
import MarkdownPreviewSkeleton from './components/MarkdownPreviewSkeleton.js';
import { MarkdownTabs } from './components/MarkdownTabs.js';
import {
  InitializedEditorType,
  MarkdownTextarea,
} from './components/MarkdownTextarea/MarkdownTextarea.js';
import { MarkdownToolbar } from './components/MarkdownToolbar.js';
import { openCheatsheetModal } from './dialogs/CheatsheetModalDialog.js';
import { createMarkdownActions } from './MarkdownActions.js';
import { MarkdownTab, PreviewComponents } from './types.js';

const MarkdownPreview = React.lazy(() => import('./components/MarkdownPreview.js'));

const styles = {
  container: css({
    display: 'flex',
    flexDirection: 'column',
    fontFamily: tokens.fontStackPrimary,
  }),
};

export interface MarkdownEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;
  /**
   * Minimum height to set for the markdown text area and preview
   */
  minHeight?: string | number;

  sdk: FieldAppSDK;

  previewComponents?: PreviewComponents;
  onReady?: Function;
}

export function MarkdownEditor(
  props: MarkdownEditorProps & {
    disabled: boolean;
    value: string | null | undefined;
    saveValueToSDK: Function;
    externalReset?: number;
  }
) {
  const prevExternalReset = React.useRef(props.externalReset);
  const [currentValue, setCurrentValue] = React.useState<string>(props.value ?? '');
  const [selectedTab, setSelectedTab] = React.useState<MarkdownTab>('editor');
  const [editor, setEditor] = React.useState<InitializedEditorType | null>(null);
  const [canUploadAssets, setCanUploadAssets] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (editor && props.onReady) {
      props.onReady(editor);
      // fix: http://codemirror.977696.n3.nabble.com/codemirror-content-not-visible-in-bootstrap-modal-td4026988.html
      setTimeout(() => {
        editor.refresh();
      }, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: Evaluate the dependencies
  }, [editor]);

  React.useEffect(() => {
    props.sdk.access.can('create', 'Asset').then((value) => {
      setCanUploadAssets(value);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: Evaluate the dependencies
  }, []);

  React.useEffect(() => {
    if (editor) {
      editor.setReadOnly(props.disabled);
    }
  }, [editor, props.disabled]);

  React.useEffect(() => {
    // Received new props from external
    if (props.externalReset !== prevExternalReset.current) {
      prevExternalReset.current = props.externalReset;
      editor?.setContent(props.value ?? '');
    }
  }, [props.value, props.externalReset, editor]);

  const isActionDisabled = editor === null || props.disabled || selectedTab !== 'editor';

  const direction = props.sdk.locales.direction[props.sdk.field.locale] ?? 'ltr';

  const actions = React.useMemo(() => {
    return createMarkdownActions({ sdk: props.sdk, editor, locale: props.sdk.field.locale });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: Evaluate the dependencies
  }, [editor]);

  const openMarkdownHelp = React.useCallback(() => {
    openCheatsheetModal(props.sdk.dialogs);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: Evaluate the dependencies
  }, []);

  return (
    <div className={styles.container} data-test-id="markdown-editor">
      <MarkdownTabs
        active={selectedTab}
        onSelect={(tab) => {
          setSelectedTab(tab);
        }}
      />
      <MarkdownToolbar
        mode="default"
        disabled={isActionDisabled}
        canUploadAssets={canUploadAssets}
        actions={actions}
      />
      <MarkdownTextarea
        minHeight={props.minHeight}
        mode="default"
        visible={selectedTab === 'editor'}
        disabled={isActionDisabled}
        direction={direction}
        onReady={(editor) => {
          editor.setContent(props.value ?? '');
          editor.setReadOnly(props.disabled);
          setEditor(editor);
          editor.events.onChange((value: string) => {
            // Trim empty lines
            const trimmedValue = value.replace(/^\s+$/gm, '');
            props.saveValueToSDK(trimmedValue);
            setCurrentValue(value);
          });
        }}
      />
      {selectedTab === 'preview' && (
        <React.Suspense fallback={<MarkdownPreviewSkeleton />}>
          <MarkdownPreview
            direction={direction}
            minHeight={props.minHeight}
            mode="default"
            value={currentValue}
            previewComponents={props.previewComponents}
          />
        </React.Suspense>
      )}
      <MarkdownBottomBar>
        <MarkdownHelp mode={selectedTab} onClick={openMarkdownHelp} />
      </MarkdownBottomBar>
      <MarkdownConstraints sdk={props.sdk} value={currentValue} />
    </div>
  );
}

export function MarkdownEditorConnected(props: MarkdownEditorProps) {
  return (
    <FieldConnector<string>
      debounce={300}
      field={props.sdk.field}
      isInitiallyDisabled={props.isInitiallyDisabled}
    >
      {({ value, disabled, setValue, externalReset }) => (
        <MarkdownEditor
          {...props}
          value={value}
          disabled={disabled}
          saveValueToSDK={setValue}
          externalReset={externalReset}
        />
      )}
    </FieldConnector>
  );
}
