import * as React from 'react';

import { GlobalStyles } from '@contentful/f36-core';
import tokens from '@contentful/f36-tokens';
import { SharedQueryClientProvider } from '@contentful/field-editor-shared/react-query';
import { createTestQueryClient } from '@contentful/field-editor-test-utils';
import { MountOptions, MountReturn, mount as cyMount } from '@cypress/react';
import { Global } from '@emotion/core';

function TestStyles() {
  return <Global styles={{ body: { padding: tokens.spacingM } }} />;
}

export function mount(
  node: React.ReactNode,
  options?: MountOptions,
): Cypress.Chainable<MountReturn> {
  // Create a fresh QueryClient for each test to ensure isolation
  const queryClient = createTestQueryClient();

  return cyMount(
    <>
      <GlobalStyles withNormalize={true} />
      <TestStyles />
      <SharedQueryClientProvider client={queryClient}>{node}</SharedQueryClientProvider>
    </>,
    options,
  );
}
