import React from 'react';
import { css, cx } from 'emotion';
import { isRtlLang } from 'rtl-detect';
import { DialogsAPI, DialogExtensionSDK } from 'contentful-ui-extensions-sdk';
import { Icon } from '@contentful/forma-36-react-components';
import { MarkdownDialogType, MarkdownDialogsParams } from '../types';
import { InitializedEditorType } from '../components/MarkdownTextarea/MarkdownTextarea';
import { MarkdownToolbar } from '../components/MarkdownToolbar';
import { MarkdownTextarea } from '../components/MarkdownTextarea/MarkdownTextarea';
import { MarkdownPreview } from '../components/MarkdownPreview/MarkdownPreview';
import { MarkdownBottomBar, MarkdownHelp } from '../components/MarkdownBottomBar';
import { createMarkdownActions } from '../MarkdownActions';
import { openCheatsheetModal } from '../dialogs/CheatsheetModalDialog';
import tokens from '@contentful/forma-36-tokens';

export type ZenModeResult = {
  value: string;
  cursor?: {
    ch: number;
    line: number;
  };
};

type ZenModeDialogProps = {
  onClose: (result: ZenModeResult) => void;
  initialValue: string;
  initialCursor?: {
    ch: number;
    line: number;
  };
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
  editorSplitFullscreen: css({
    left: 0,
    right: 0,
    width: '100%'
  }),
  previewSplit: css({
    width: '50%',
    position: 'absolute',
    top: '48px',
    right: 0,
    bottom: '36px',
    overflowX: 'hidden',
    overflowY: 'scroll'
  }),
  separator: css({
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '1px',
    background: tokens.colorElementDark,
    left: '50%'
  }),
  button: css({
    position: 'fixed',
    cursor: 'pointer',
    zIndex: 105,
    top: '49%',
    height: '30px',
    backgroundColor: tokens.colorElementLightest,
    border: `1px solid ${tokens.colorElementDark}`,
    padding: 0
  }),
  hideButton: css({
    left: '50%'
  }),
  showButton: css({
    right: 0,
    borderRightWidth: 0
  }),
  icon: css({
    verticalAlign: 'middle'
  })
};

export const ZenModeModalDialog = (props: ZenModeDialogProps) => {
  const [currentValue, setCurrentValue] = React.useState<string>(props.initialValue ?? '');
  const [showPreview, setShowPreview] = React.useState<boolean>(true);
  const [editor, setEditor] = React.useState<InitializedEditorType | null>(null);

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props.sdk.window.updateHeight('100%' as any);
  }, []);

  const actions = createMarkdownActions({ sdk: props.sdk, editor, locale: props.locale });
  actions.closeZenMode = () => {
    props.onClose({
      value: currentValue,
      cursor: editor?.getCursor()
    });
  };

  const direction = isRtlLang(props.locale) ? 'rtl' : 'ltr';

  return (
    <div className={styles.root} data-test-id="zen-mode-markdown-editor">
      <div className={styles.topSplit}>
        <MarkdownToolbar mode="zen" disabled={false} canUploadAssets={false} actions={actions} />
      </div>

      <div
        className={cx(styles.editorSplit, {
          [styles.editorSplitFullscreen]: showPreview === false
        })}>
        <MarkdownTextarea
          mode="zen"
          visible
          disabled={false}
          direction={direction}
          onReady={editor => {
            editor.setContent(props.initialValue ?? '');
            editor.setReadOnly(false);
            if (props.initialCursor) {
              editor.setCursor(props.initialCursor);
            }
            setEditor(editor);
            editor.focus();
            editor.events.onChange((value: string) => {
              setCurrentValue(value);
            });
          }}
        />
      </div>
      {showPreview && <div className={styles.separator} />}
      {showPreview && (
        <button
          className={cx(styles.button, styles.hideButton)}
          aria-label="Hide preview"
          onClick={() => {
            setShowPreview(false);
          }}>
          <Icon icon="ChevronRight" color="muted" size="tiny" className={styles.icon} />
        </button>
      )}
      {!showPreview && (
        <button
          className={cx(styles.button, styles.showButton)}
          aria-label="Show preview"
          onClick={() => {
            setShowPreview(true);
          }}>
          <Icon icon="ChevronLeft" color="muted" size="tiny" className={styles.icon} />
        </button>
      )}
      {showPreview && (
        <div className={styles.previewSplit}>
          <MarkdownPreview direction={direction} mode="zen" value={currentValue} />
        </div>
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
  options: { initialValue: string; locale: string; initialCursor?: { ch: number; line: number } }
): Promise<ZenModeResult> => {
  return dialogs.openExtension({
    width: 'zen' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    shouldCloseOnEscapePress: false,
    minHeight: '100vh',
    shouldCloseOnOverlayClick: false,
    parameters: {
      type: MarkdownDialogType.zenMode,
      initialValue: options.initialValue,
      initialCursor: options.initialCursor,
      locale: options.locale
    } as MarkdownDialogsParams
  });
};
