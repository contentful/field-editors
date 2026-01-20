import React from 'react';

import { QueryClient } from '@tanstack/react-query';

import { RichTextEditor } from '../../../packages/rich-text/src';
import { createRichTextFakeSdk } from '../../fixtures';
import { mount } from '../mount';
import { RichTextPage } from './RichTextPage';

type MountRichTextEditorOptions = Partial<React.ComponentProps<typeof RichTextEditor>> & {
  prefetchContentTypes?: boolean;
};

export const mountRichTextEditor = async (
  options: MountRichTextEditorOptions = {},
): Promise<void> => {
  const {
    sdk,
    isInitiallyDisabled = false,
    prefetchContentTypes = false,
    ...restOptions
  } = options;
  const rtSDK = sdk || createRichTextFakeSdk();

  // Pre-populate React Query cache with content types for synchronous access
  if (prefetchContentTypes) {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: Infinity,
          refetchOnMount: false,
        },
      },
    });

    // Fetch content types and populate cache before mounting
    const contentTypes = await rtSDK.cma.contentType.getMany({ query: { limit: 1000, skip: 0 } });
    queryClient.setQueryData(['contentTypes'], contentTypes.items);

    mount(
      <RichTextEditor
        sdk={rtSDK}
        isInitiallyDisabled={isInitiallyDisabled}
        queryClient={queryClient}
        {...restOptions}
      />,
    );
  } else {
    mount(
      <RichTextEditor sdk={rtSDK} isInitiallyDisabled={isInitiallyDisabled} {...restOptions} />,
    );
  }
};

export const focusEditorAndType = (richText: RichTextPage, content: string): void => {
  richText.editor.click();
  richText.editor.should('be.focused');
  richText.editor.type(content);
};
