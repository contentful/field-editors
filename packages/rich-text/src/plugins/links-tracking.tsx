import React, { ComponentProps } from 'react';

import { useContentfulEditorRef } from '../ContentfulEditorProvider';
import { HyperlinkElementProps } from './Hyperlink/components/EntityHyperlink';

export function withLinkTracking(Component: React.ComponentType<HyperlinkElementProps>) {
  return function ComponentWithTracking(props: ComponentProps<typeof Component>) {
    const editor = useContentfulEditorRef();

    const onEntityFetchComplete = React.useCallback(
      () => editor?.tracking.onViewportAction('linkRendered'),
      [editor]
    );

    return <Component {...props} onEntityFetchComplete={onEntityFetchComplete} />;
  };
}
