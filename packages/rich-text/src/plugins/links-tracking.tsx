import React, { ComponentProps } from 'react';

import { useTrackingContext } from '../TrackingProvider';

type WithEntityFetchProps = {
  onEntityFetchComplete: VoidFunction;
} & JSX.IntrinsicAttributes;

export function withLinkTracking(Component: React.ComponentType<WithEntityFetchProps>) {
  return function ComponentWithTracking(props: ComponentProps<typeof Component>) {
    const tracking = useTrackingContext();

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
