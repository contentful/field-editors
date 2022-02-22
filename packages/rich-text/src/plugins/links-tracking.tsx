import React, { ComponentProps } from 'react';

import { useContentfulEditorRef } from '../ContentfulEditorProvider';

type WithEntityFetchProps = {
  onEntityFetchComplete: VoidFunction;
} & JSX.IntrinsicAttributes;

export function withLinkTracking(Component: React.ComponentType<WithEntityFetchProps>) {
  return function ComponentWithTracking(props: ComponentProps<typeof Component>) {
    const editor = useContentfulEditorRef();
    const onEntityFetchComplete = React.useCallback(
      () => editor.tracking.onViewportAction('linkRendered'),
      [editor]
    );

    return <Component {...props} onEntityFetchComplete={onEntityFetchComplete} />;
  };
}
