import * as React from 'react';

import constate from 'constate';

export type RichTextTrackingActionName =
  //Viewport action names
  | 'insertTable'
  | 'insertTableRow'
  | 'insertTableColumn'
  | 'removeTable'
  | 'removeTableRow'
  | 'removeTableColumn'
  | 'paste'
  | 'linkRendered'
  | 'openEditHyperlinkDialog'
  | 'cancelEditHyperlinkDialog'
  | 'edit'
  //Shortcut action names
  | 'insert'
  | 'remove'
  | 'mark'
  | 'unmark'
  | 'openCreateEmbedDialog'
  | 'cancelCreateEmbedDialog';

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

function useTracking({ onAction }: TrackingProviderProps): TrackingProvider {
  const trackingMemo = React.useMemo<TrackingProvider>(
    () => ({
      onViewportAction: (actionName: RichTextTrackingActionName, data = {}) =>
        onAction(actionName, { origin: 'viewport-interaction', ...data }),
      onShortcutAction: (actionName: RichTextTrackingActionName, data = {}) =>
        onAction(actionName, { origin: 'shortcut', ...data }),
      onToolbarAction: (actionName: RichTextTrackingActionName, data = {}) =>
        onAction(actionName, { origin: 'toolbar-icon', ...data }),
      onCommandPaletteAction: (actionName: RichTextTrackingActionName, data = {}) =>
        onAction(actionName, { origin: 'command-palette', ...data }),
    }),
    [] // eslint-disable-line
  );

  return trackingMemo;
}

export const [TrackingProvider, useTrackingContext] = constate(useTracking);
