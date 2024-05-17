import { PlatePlugin } from '../../internal/types';
import { getCharacterCount } from './utils';

export type RichTextTrackingActionName =
  // Elements
  | 'edit'
  | 'insert'
  | 'remove'
  // Marks
  | 'mark'
  | 'unmark'
  // Tables
  | 'insertTable'
  | 'insertTableRow'
  | 'insertTableColumn'
  | 'removeTable'
  | 'removeTableRow'
  | 'removeTableColumn'
  // Copy & Paste
  | 'paste'
  | 'invalidTablePaste'
  // Undo & Redo
  | 'undo'
  | 'redo'
  // Hyperlinks
  | 'cancelCreateHyperlinkDialog'
  | 'cancelEditHyperlinkDialog'
  | 'linkRendered'
  | 'openCreateHyperlinkDialog'
  | 'openEditHyperlinkDialog'
  | 'unlinkHyperlinks'
  // Embeds
  | 'openCreateEmbedDialog'
  | 'cancelCreateEmbedDialog'
  // CommandPalette
  | 'openRichTextCommandPalette'
  | 'cancelRichTextCommandPalette';

export type RichTextTrackingActionHandler = (
  name: RichTextTrackingActionName,
  data: Record<string, unknown>
) => unknown;

export interface TrackingPluginActions {
  onViewportAction: (
    actionName: RichTextTrackingActionName,
    data?: Record<string, unknown>
  ) => ReturnType<RichTextTrackingActionHandler>;

  onShortcutAction: (
    actionName: RichTextTrackingActionName,
    data?: Record<string, unknown>
  ) => ReturnType<RichTextTrackingActionHandler>;

  onShortcutOrViewportAction: (
    actionName: RichTextTrackingActionName,
    data?: Record<string, unknown>
  ) => ReturnType<RichTextTrackingActionHandler>;

  onToolbarAction: (
    actionName: RichTextTrackingActionName,
    data?: Record<string, unknown>
  ) => ReturnType<RichTextTrackingActionHandler>;

  onCommandPaletteAction: (
    actionName: RichTextTrackingActionName,
    data?: Record<string, unknown>
  ) => ReturnType<RichTextTrackingActionHandler>;
}

const actionOrigin = {
  TOOLBAR: 'toolbar-icon',
  SHORTCUT: 'shortcut',
  VIEWPORT: 'viewport-interaction',
  SHORTCUT_OR_VIEWPORT: 'shortcut-or-viewport',
  COMMAND_PALETTE: 'command-palette',
};

export function getPastingSource(data: DataTransfer) {
  const textHtml = data.getData('text/html');
  const doc = new DOMParser().parseFromString(textHtml, 'text/html');

  if (doc.querySelector('[id*="docs-internal-guid"]')) {
    return 'Google Docs';
  }

  if (doc.querySelector('google-sheets-html-origin') || doc.querySelector('[data-sheets-value]')) {
    return 'Google Spreadsheets';
  }

  if (doc.querySelector('meta[content*="Microsoft Excel"]')) {
    return 'Microsoft Excel';
  }

  if (doc.querySelector('meta[content*="Microsoft Word"]')) {
    return 'Microsoft Word';
  }

  // TODO: MS Word Online doesn't give us specific tags, we might need to have a closer look at its tracking result since we are using generic values to identify it
  if (
    doc.querySelector('[style*="Arial_MSFontService"]') &&
    (doc.querySelector('.TextRun') || doc.querySelector('.OutlineElement'))
  ) {
    return 'Microsoft Word Online';
  }

  if (doc.querySelector('meta[content="Cocoa HTML Writer"]')) {
    return 'Apple Notes';
  }

  if (doc.querySelector('[style*="Slack-Lato, Slack-Fractions"]')) {
    return 'Slack';
  }

  return 'Unknown';
}

export const createTrackingPlugin = (onAction: RichTextTrackingActionHandler): PlatePlugin => {
  const trackingActions: TrackingPluginActions = {
    onViewportAction: (actionName: RichTextTrackingActionName, data = {}) =>
      onAction(actionName, { origin: actionOrigin.VIEWPORT, ...data }),

    onShortcutAction: (actionName: RichTextTrackingActionName, data = {}) =>
      onAction(actionName, { origin: actionOrigin.SHORTCUT, ...data }),

    onShortcutOrViewportAction: (actionName: RichTextTrackingActionName, data = {}) =>
      onAction(actionName, { origin: actionOrigin.SHORTCUT_OR_VIEWPORT, ...data }),

    onToolbarAction: (actionName: RichTextTrackingActionName, data = {}) =>
      onAction(actionName, { origin: actionOrigin.TOOLBAR, ...data }),

    onCommandPaletteAction: (actionName: RichTextTrackingActionName, data = {}) =>
      onAction(actionName, {
        origin: actionOrigin.COMMAND_PALETTE,
        ...data,
      }),
  };

  return {
    key: 'TrackingPlugin',
    withOverrides: (editor) => {
      const { insertData, undo, redo } = editor;

      editor.tracking = trackingActions;

      editor.insertData = (data) => {
        const isCopyAndPaste = data.types.length !== 0;
        if (isCopyAndPaste) {
          const characterCountSelection = window.getSelection()?.toString().length;
          const characterCountBefore = getCharacterCount(editor);

          setTimeout(() => {
            const characterCountAfter = getCharacterCount(editor);

            trackingActions.onShortcutOrViewportAction('paste', {
              characterCountAfter,
              characterCountBefore,
              characterCountSelection,
              source: getPastingSource(data),
            });
          });
        }

        insertData(data);
      };

      editor.undo = (source?: 'toolbar' | 'shortcut') => {
        undo();
        if (source === 'toolbar') {
          editor.tracking.onToolbarAction('undo');
        } else {
          editor.tracking.onShortcutAction('undo');
        }
      };

      editor.redo = (source?: 'toolbar' | 'shortcut') => {
        redo();
        if (source === 'toolbar') {
          editor.tracking.onToolbarAction('redo');
        } else {
          editor.tracking.onShortcutAction('redo');
        }
      };
      return editor;
    },
  };
};
