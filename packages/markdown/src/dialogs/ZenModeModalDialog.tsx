import React from 'react';
import { css } from 'emotion';
import { DialogsAPI, BaseExtensionSDK } from 'contentful-ui-extensions-sdk';
import { MarkdownDialogType, MarkdownDialogsParams } from '../types';
import { InitializedEditorType } from '../components/MarkdownTextarea/MarkdownTextarea';
import { MarkdownToolbar } from '../components/MarkdownToolbar';
import { MarkdownTextarea } from '../components/MarkdownTextarea/MarkdownTextarea';
import { MarkdownPreview } from '../components/MarkdownPreview/MarkdownPreview';
import { MarkdownBottomBar, MarkdownHelp } from '../components/MarkdownBottomBar';
import { createMarkdownActions } from '../MarkdownActions';

export type ZenModeResult = string;

type ZenModeDialogProps = {
  onClose: (result: ZenModeResult) => void;
  initialValue: string;
  locale: string;
  sdk: BaseExtensionSDK;
};

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column'
  }),
  splitContainer: css({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row'
  }),
  split: css({
    width: '50%'
  })
};

export const ZenModeModalDialog = (props: ZenModeDialogProps) => {
  const [currentValue, setCurrentValue] = React.useState<string>(props.initialValue ?? '');
  const [editor, setEditor] = React.useState<InitializedEditorType | null>(null);

  const actions = createMarkdownActions({ sdk: props.sdk, editor, locale: props.locale });
  actions.closeZenMode = () => {
    props.onClose(currentValue);
  };

  return (
    <div className={styles.root} data-test-id="zen-mode-markdown-editor">
      <MarkdownToolbar mode="zen" disabled={false} canUploadAssets={false} actions={actions} />
      <div className={styles.splitContainer}>
        <div className={styles.split}>
          <MarkdownTextarea
            visible
            disabled={false}
            direction="ltr"
            onReady={editor => {
              editor.setContent(props.initialValue ?? '');
              editor.setReadOnly(false);
              setEditor(editor);
              editor.events.onChange((value: string) => {
                setCurrentValue(value);
              });
            }}
          />
        </div>
        <div className={styles.split}>
          <MarkdownPreview value={currentValue} />
        </div>
      </div>
      <MarkdownBottomBar>
        <MarkdownHelp onClick={() => {}} />
      </MarkdownBottomBar>
    </div>
  );
};

export const openZenMode = (
  dialogs: DialogsAPI,
  options: { initialValue: string; locale: string }
): Promise<ZenModeResult> => {
  return dialogs.openExtension({
    width: 'zen' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    shouldCloseOnEscapePress: false,
    minHeight: '100vh',
    shouldCloseOnOverlayClick: false,
    parameters: {
      type: MarkdownDialogType.zenMode,
      initialValue: options.initialValue,
      locale: options.locale
    } as MarkdownDialogsParams
  });
};
