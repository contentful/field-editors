import { RichTextPlugin } from '../../types';
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
  // Hyperlinks
  | 'cancelCreateHyperlinkDialog'
  | 'cancelEditHyperlinkDialog'
  | 'linkRendered'
  | 'openCreateHyperlinkDialog'
  | 'openEditHyperlinkDialog'
  | 'unlinkHyperlinks'
  // Embeds
  | 'openCreateEmbedDialog'
  | 'cancelCreateEmbedDialog';

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
  COMMAND_PALETTE: 'command-palette',
};

export const createTrackingPlugin = (onAction: RichTextTrackingActionHandler): RichTextPlugin => {
  const trackingActions: TrackingPluginActions = {
    onViewportAction: (actionName: RichTextTrackingActionName, data = {}) =>
      onAction(actionName, { origin: actionOrigin.VIEWPORT, ...data }),

    onShortcutAction: (actionName: RichTextTrackingActionName, data = {}) =>
      onAction(actionName, { origin: actionOrigin.SHORTCUT, ...data }),

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
      const { insertData } = editor;

      editor.tracking = trackingActions;

      editor.insertData = (data) => {
        const isCopyAndPaste = data.types.length !== 0;
        if (isCopyAndPaste) {
          const characterCountSelection = window.getSelection()?.toString().length;
          const characterCountBefore = getCharacterCount(editor);

          setTimeout(() => {
            const characterCountAfter = getCharacterCount(editor);

            trackingActions.onShortcutAction('paste', {
              characterCountAfter,
              characterCountBefore,
              characterCountSelection,
            });
          });
        }

        insertData(data);
      };

      return editor;
    },
    then: (editor) => ({
      editor: {
        insertData: {
          format: 'text/html',
          getFragment: ({ data }) => {
            let source;

            if (data.includes('docs-internal-guid')) {
              source = 'Google Docs';
            }

            if (data.includes('<google-sheets-html-origin>') || data.includes('data-sheets-')) {
              source = 'Google Spreadsheets';
            }

            if (data.includes('class="TextRun') || data.includes('class="OutlineElement')) {
              source = 'Microsoft Word Online';
            }

            if (data.includes('<meta name="Generator" content="Cocoa HTML Writer">')) {
              source = 'Apple Notes';
            }

            if (data.includes('Slack-Lato, Slack-Fractions')) {
              source = 'Slack';
            }

            if (source) {
              editor.tracking.onShortcutAction('paste', {
                source,
              });
            }

            return undefined;
          },
        },
      },
    }),
  };
};
