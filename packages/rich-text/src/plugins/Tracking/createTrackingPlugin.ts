import { PlateEditor } from '@udecode/plate-core';

import { RichTextEditor, RichTextPlugin } from '../../types';
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
  // Hyperlinks
  | 'cancelCreateHyperlinkDialog'
  | 'cancelEditHyperlinkDialog'
  | 'linkRendered'
  | 'openCreateHyperlinkDialog'
  | 'openEditHyperlinkDialog'
  | 'unlinkHyperlinks'
  // Embeddeds
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
    withOverrides: (editor: PlateEditor): RichTextEditor => {
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

      return editor as RichTextEditor;
    },
  };
};
