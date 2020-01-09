import React from 'react';
import { css } from 'emotion';
import { DialogsAPI, DialogExtensionSDK } from 'contentful-ui-extensions-sdk';
import { MarkdownDialogType, MarkdownDialogsParams } from '../types';
import { InitializedEditorType } from '../components/MarkdownTextarea/MarkdownTextarea';
import { MarkdownToolbar } from '../components/MarkdownToolbar';
import { MarkdownTextarea } from '../components/MarkdownTextarea/MarkdownTextarea';
import { MarkdownPreview } from '../components/MarkdownPreview/MarkdownPreview';
import { MarkdownBottomBar, MarkdownHelp } from '../components/MarkdownBottomBar';
import { createMarkdownActions } from '../MarkdownActions';
import { openCheatsheetModal } from '../dialogs/CheatsheetModalDialog';

export type ZenModeResult = string;

type ZenModeDialogProps = {
  onClose: (result: ZenModeResult) => void;
  initialValue: string;
  locale: string;
  sdk: DialogExtensionSDK;
};

const styles = {
  root: css({
    position: 'relative',
    height: '100vh'
  }),
  topSplit: css({
    position: 'absolute',
    top: 0,
    height: '48px',
    left: 0,
    right: 0
  }),
  bottomSplit: css({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '36px'
  }),
  editorSplit: css({
    width: '50%',
    position: 'absolute',
    top: '48px',
    left: 0,
    bottom: '36px',
    overflowX: 'hidden',
    overflowY: 'scroll'
  }),
  previewSplit: css({
    width: '50%',
    position: 'absolute',
    top: '48px',
    right: 0,
    bottom: '36px',
    overflowX: 'hidden',
    overflowY: 'scroll'
  })
};

export const ZenModeModalDialog = (props: ZenModeDialogProps) => {
  const [currentValue, setCurrentValue] = React.useState<string>(props.initialValue ?? '');
  const [editor, setEditor] = React.useState<InitializedEditorType | null>(null);

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props.sdk.window.updateHeight('100%' as any);
  }, []);

  const actions = createMarkdownActions({ sdk: props.sdk, editor, locale: props.locale });
  actions.closeZenMode = () => {
    props.onClose(currentValue);
  };

  return (
    <div className={styles.root} data-test-id="zen-mode-markdown-editor">
      <div className={styles.topSplit}>
        <MarkdownToolbar mode="zen" disabled={false} canUploadAssets={false} actions={actions} />
      </div>

      <div className={styles.editorSplit}>
        <MarkdownTextarea
          mode="zen"
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
      <div className={styles.previewSplit}>
        <MarkdownPreview mode="zen" value={currentValue} />
      </div>
      <div className={styles.bottomSplit}>
        <MarkdownBottomBar>
          <MarkdownHelp
            onClick={() => {
              openCheatsheetModal(props.sdk.dialogs);
            }}
          />
        </MarkdownBottomBar>
      </div>
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
