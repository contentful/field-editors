import * as React from 'react';

import constate from 'constate';

export type RichTextTrackingActionName =
  | 'insertTable'
  | 'insertTableRow'
  | 'insertTableColumn'
  | 'removeTable'
  | 'removeTableRow'
  | 'removeTableColumn'
  | 'paste';

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
}

function useTracking({ onAction }: TrackingProviderProps): TrackingProvider {
  const trackingMemo = React.useMemo<TrackingProvider>(
    () => ({
      onViewportAction: (actionName: RichTextTrackingActionName, data = {}) =>
        onAction(actionName, { origin: 'viewport-interaction', ...data }),
    }),
    [] // eslint-disable-line
  );

  return trackingMemo;
}

export const [TrackingProvider, useTrackingContext] = constate(useTracking);
