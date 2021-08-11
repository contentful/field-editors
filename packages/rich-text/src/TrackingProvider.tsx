import * as React from 'react';
import constate from 'constate';

interface TrackingProviderProps {
  onAction: (name: string, data: Record<string, unknown>) => unknown;
}

export interface TrackingProvider {
  onViewportAction: (
    actionName: string,
    data?: Record<string, unknown>
  ) => ReturnType<TrackingProviderProps['onAction']>;
}

function useTracking({ onAction }: TrackingProviderProps): TrackingProvider {
  const trackingMemo = React.useMemo<TrackingProvider>(
    () => ({
      onViewportAction: (actionName, data = {}) =>
        onAction(actionName, { ...data, origin: 'viewport-interaction' }),
    }),
    [] // eslint-disable-line
  );

  return trackingMemo;
}

export const [TrackingProvider, useTrackingContext] = constate(useTracking);
