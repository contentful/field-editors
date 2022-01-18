import React, { ComponentProps } from 'react';

import { TrackingProvider } from '../TrackingProvider';

type WithEntityFetchProps = {
  onEntityFetchComplete: VoidFunction;
} & JSX.IntrinsicAttributes;

export function withLinkTracking(
  tracking: TrackingProvider,
  Component: React.ComponentType<WithEntityFetchProps>
) {
  return function ComponentWithTracking(props: ComponentProps<typeof Component>) {
    return (
      <Component
        {...props}
        onEntityFetchComplete={() => {
          tracking.onViewportAction('linkRendered');
        }}
      />
    );
  };
}
