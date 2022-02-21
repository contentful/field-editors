import React, { ComponentProps } from 'react';

import { useContentfulEditor } from '../ContentfulEditorProvider';

type WithEntityFetchProps = {
  onEntityFetchComplete: VoidFunction;
} & JSX.IntrinsicAttributes;

export function withLinkTracking(Component: React.ComponentType<WithEntityFetchProps>) {
  return function ComponentWithTracking(props: ComponentProps<typeof Component>) {
    const editor = useContentfulEditor();

    return (
      <Component
        {...props}
        onEntityFetchComplete={() => {
          editor.tracking.onViewportAction('linkRendered');
        }}
      />
    );
  };
}
