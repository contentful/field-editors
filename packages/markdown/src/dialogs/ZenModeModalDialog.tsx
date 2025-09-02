import * as React from 'react';

import { DialogAppSDK, DialogsAPI } from '@contentful/app-sdk';
import { Grid } from '@contentful/f36-components';
import { CaretLeftIcon, CaretRightIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { css, cx } from 'emotion';

import { MarkdownBottomBar, MarkdownHelp } from '../components/MarkdownBottomBar';
import MarkdownPreviewSkeleton from '../components/MarkdownPreviewSkeleton';
import {
  InitializedEditorType,
  MarkdownTextarea,
} from '../components/MarkdownTextarea/MarkdownTextarea';
import { MarkdownToolbar } from '../components/MarkdownToolbar';
import { openCheatsheetModal } from '../dialogs/CheatsheetModalDialog';
import { createMarkdownActions } from '../MarkdownActions';
import { MarkdownDialogsParams, MarkdownDialogType, PreviewComponents } from '../types';

const MarkdownPreview = React.lazy(() => import('../components/MarkdownPreview'));

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
  sdk: DialogAppSDK;
  previewComponents?: PreviewComponents;
};

const styles = {
  root: css({
    display: 'grid',
    gridTemplateRows: 'min-content 1fr min-content',
    gridTemplateColumns: '1fr 1px 1fr',
    height: '85vh',
  }),
  topSplit: css({
    gridRow: '1 / 2',
    gridColumn: '1 / 4',
  }),
  bottomSplit: css({
    gridRow: '3 / 4',
    gridColumn: '1 / 4',
  }),
  editorSplit: css({
    gridRow: '2 / 3',
    gridColumn: '1 / 2',
    overflowY: 'scroll',
  }),
  editorSplitFullscreen: css({
    gridRow: '2 / 3',
    gridColumn: '1 / 4',
    overflowY: 'scroll',
  }),
  previewSplit: css({
    gridRow: '2 / 3',
    gridColumn: '3 / 4',
    overflowY: 'scroll',
  }),
  separator: css({
    gridRow: '2 / 3',
    gridColumn: '2 / 3',
    backgroundColor: tokens.gray400,
    width: '1px',
  }),
  button: css({
    cursor: 'pointer',
    zIndex: 105,
    height: '30px',
    backgroundColor: tokens.gray100,
    border: `1px solid ${tokens.gray400}`,
    padding: 0,
  }),
  hideButton: css({
    gridRow: '2 / 3',
    gridColumn: '2 / 3',
    justifySelf: 'end',
    alignSelf: 'center',
  }),
  showButton: css({
    gridRow: '2 / 3',
    gridColumn: '3 / 4',
    justifySelf: 'end',
    alignSelf: 'center',
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
    // eslint-disable-next-line -- TODO: describe this disable  @typescript-eslint/no-explicit-any
    props.sdk?.window?.updateHeight('100%' as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: Evaluate the dependencies
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: Evaluate the dependencies
  }, [editor]);

  actions.closeZenMode = () => {
    props.onClose({
      value: currentValue,
      cursor: editor?.getCursor(),
    });
  };

  const direction = props.sdk.locales.direction[props.locale] ?? 'ltr';

  return (
    <Grid className={styles.root} data-test-id="zen-mode-markdown-editor">
      <Grid.Item className={styles.topSplit}>
        <MarkdownToolbar mode="zen" disabled={false} canUploadAssets={false} actions={actions} />
      </Grid.Item>

      <Grid.Item
        className={cx(styles.editorSplit, {
          [styles.editorSplitFullscreen]: showPreview === false,
        })}
      >
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
      </Grid.Item>
      {showPreview && (
        <Grid.Item className={styles.previewSplit}>
          <React.Suspense fallback={<MarkdownPreviewSkeleton />}>
            <MarkdownPreview
              direction={direction}
              mode="zen"
              value={currentValue}
              previewComponents={props.previewComponents}
            />
          </React.Suspense>
        </Grid.Item>
      )}
      {showPreview && <Grid.Item className={styles.separator} />}
      {showPreview && (
        <button
          className={cx(styles.button, styles.hideButton)}
          aria-label="Hide preview"
          onClick={() => {
            setShowPreview(false);
          }}
        >
          <CaretRightIcon variant="muted" size="tiny" className={styles.icon} />
        </button>
      )}
      {!showPreview && (
        <button
          className={cx(styles.button, styles.showButton)}
          aria-label="Show preview"
          onClick={() => {
            setShowPreview(true);
          }}
        >
          <CaretLeftIcon variant="muted" size="tiny" className={styles.icon} />
        </button>
      )}
      <Grid.Item className={styles.bottomSplit}>
        <MarkdownBottomBar>
          <MarkdownHelp
            mode="zen"
            onClick={() => {
              openCheatsheetModal(props.sdk.dialogs);
            }}
          />
        </MarkdownBottomBar>
      </Grid.Item>
    </Grid>
  );
};

export const openZenMode = (
  dialogs: DialogsAPI,
  options: { initialValue: string; locale: string }
): Promise<ZenModeResult> => {
  return dialogs.openCurrent({
    width: 'fullWidth',
    shouldCloseOnEscapePress: false,
    shouldCloseOnOverlayClick: true,
    parameters: {
      type: MarkdownDialogType.zenMode,
      initialValue: options.initialValue,
      locale: options.locale,
    } as MarkdownDialogsParams,
  });
};
