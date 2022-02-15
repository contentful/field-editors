import * as React from 'react';

import constate from 'constate';

export type RichTextTrackingActionName =
  // General
  | 'edit'
  | 'insert'
  | 'remove'
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
  | 'unlinkHyperlinks';

export type RichTextTrackingActionHandler = (
  name: RichTextTrackingActionName,
  data: Record<string, unknown>
) => unknown;

interface TrackingProviderProps {
  onAction: RichTextTrackingActionHandler;
}

export interface TrackingProvider {
  onViewportAction: (
    actionName: RichTextTrackingActionName,
    data?: Record<string, unknown>
  ) => ReturnType<TrackingProviderProps['onAction']>;

  onShortcutAction: (
    actionName: RichTextTrackingActionName,
    data?: Record<string, unknown>
  ) => ReturnType<TrackingProviderProps['onAction']>;

  onToolbarAction: (
    actionName: RichTextTrackingActionName,
    data?: Record<string, unknown>
  ) => ReturnType<TrackingProviderProps['onAction']>;

  onCommandPaletteAction: (
    actionName: RichTextTrackingActionName,
    data?: Record<string, unknown>
  ) => ReturnType<TrackingProviderProps['onAction']>;
}

const actionOrigin = {
  TOOLBAR: 'toolbar-icon',
  SHORTCUT: 'shortcut',
  VIEWPORT: 'viewport-interaction',
  COMMAND_PALETTE: 'command-palette',
};

function useTracking({ onAction }: TrackingProviderProps): TrackingProvider {
  const trackingMemo = React.useMemo<TrackingProvider>(
    () => ({
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
    }),
    [] // eslint-disable-line
  );

  return trackingMemo;
}

export const [TrackingProvider, useTrackingContext] = constate(useTracking);
