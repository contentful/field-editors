import React from 'react';
import { css, cx } from 'emotion';
import { DialogsAPI, DialogExtensionSDK } from '@contentful/app-sdk';
import { MarkdownDialogType, MarkdownDialogsParams, PreviewComponents } from '../types';
import { InitializedEditorType } from '../components/MarkdownTextarea/MarkdownTextarea';
import { MarkdownToolbar } from '../components/MarkdownToolbar';
import { MarkdownTextarea } from '../components/MarkdownTextarea/MarkdownTextarea';
import { MarkdownPreview } from '../components/MarkdownPreview';
import { MarkdownBottomBar, MarkdownHelp } from '../components/MarkdownBottomBar';
import { createMarkdownActions } from '../MarkdownActions';
import { openCheatsheetModal } from '../dialogs/CheatsheetModalDialog';
import tokens from '@contentful/f36-tokens';

import { ChevronRightIcon, ChevronLeftIcon } from '@contentful/f36-icons';

export type ZenModeResult = {
  value: string;
  cursor?: {
    ch: number;
    line: number;
  };
};

type ZenModeDialogProps = {
  saveValueToSDK: (value: string | null | undefined) => void;
  onClose: (result: ZenModeResult) => void;
  initialValue: string;
  locale: string;
  sdk: DialogExtensionSDK;
  previewComponents?: PreviewComponents;
};

const styles = {
  root: css({
    position: 'fixed',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  }),
  topSplit: css({
    position: 'fixed',
    top: 0,
    height: '48px',
    left: 0,
    right: 0,
  }),
  bottomSplit: css({
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '36px',
  }),
  editorSplit: css({
    width: '50%',
    position: 'fixed',
    top: '48px',
    left: 0,
    bottom: '36px',
    overflowX: 'hidden',
    overflowY: 'scroll',
  }),
  editorSplitFullscreen: css({
    left: 0,
    right: 0,
    width: '100%',
  }),
  previewSplit: css({
    width: '50%',
    position: 'fixed',
    top: '48px',
    right: 0,
    bottom: '36px',
    overflowX: 'hidden',
    overflowY: 'scroll',
  }),
  separator: css({
    position: 'fixed',
    top: '48px',
    bottom: '36px',
    width: '1px',
    background: tokens.gray400,
    left: '50%',
  }),
  button: css({
    position: 'fixed',
    cursor: 'pointer',
    zIndex: 105,
    top: '49%',
    height: '30px',
    backgroundColor: tokens.gray100,
    border: `1px solid ${tokens.gray400}`,
    padding: 0,
  }),
  hideButton: css({
    left: '50%',
  }),
  showButton: css({
    right: 0,
    borderRightWidth: 0,
  }),
  icon: css({
    verticalAlign: 'middle',
  }),
};

export const ZenModeModalDialog = (props: ZenModeDialogProps) => {
  const [currentValue, setCurrentValue] = React.useState<string>(props.initialValue ?? '');
  const [showPreview, setShowPreview] = React.useState<boolean>(true);
  const [editor, setEditor] = React.useState<InitializedEditorType | null>(null);

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props.sdk?.window?.updateHeight('100%' as any);
  }, []);

  // refresh editor right after dialog is opened to avoid disappearing effect
  React.useEffect(() => {
    setTimeout(() => {
      editor?.setFullsize();
      editor?.refresh();
    }, 150);
  }, [editor]);

  const actions = React.useMemo(() => {
    return createMarkdownActions({ sdk: props.sdk, editor, locale: props.locale });
  }, [editor]);

  actions.closeZenMode = () => {
    props.onClose({
      value: currentValue,
      cursor: editor?.getCursor(),
    });
  };

  const direction = props.sdk.locales.direction[props.locale] ?? 'ltr';

  return (
    <div className={styles.root} data-test-id="zen-mode-markdown-editor">
      <div className={styles.topSplit}>
        <MarkdownToolbar mode="zen" disabled={false} canUploadAssets={false} actions={actions} />
      </div>

      <div
        className={cx(styles.editorSplit, {
          [styles.editorSplitFullscreen]: showPreview === false,
        })}>
        <MarkdownTextarea
          mode="zen"
          visible
          disabled={false}
          direction={direction}
          onReady={(editor) => {
            editor.setContent(props.initialValue ?? '');
            editor.setReadOnly(false);
            setEditor(editor);
            editor.focus();
            editor.events.onChange((value: string) => {
              setCurrentValue(value);
              props.saveValueToSDK(value);
            });
          }}
        />
      </div>
      {showPreview && (
        <div className={styles.previewSplit}>
          <MarkdownPreview
            direction={direction}
            mode="zen"
            value={currentValue}
            previewComponents={props.previewComponents}
          />
        </div>
      )}
      {showPreview && <div className={styles.separator} />}
      {showPreview && (
        <button
          className={cx(styles.button, styles.hideButton)}
          aria-label="Hide preview"
          onClick={() => {
            setShowPreview(false);
          }}>
          <ChevronRightIcon variant="muted" size="tiny" className={styles.icon} />
        </button>
      )}
      {!showPreview && (
        <button
          className={cx(styles.button, styles.showButton)}
          aria-label="Show preview"
          onClick={() => {
            setShowPreview(true);
          }}>
          <ChevronLeftIcon variant="muted" size="tiny" className={styles.icon} />
        </button>
      )}
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
  return dialogs.openCurrent({
    width: 'zen' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    shouldCloseOnEscapePress: false,
    minHeight: '100vh',
    shouldCloseOnOverlayClick: false,
    parameters: {
      type: MarkdownDialogType.zenMode,
      initialValue: options.initialValue,
      locale: options.locale,
    } as MarkdownDialogsParams,
  });
};
