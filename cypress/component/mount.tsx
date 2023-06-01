import * as React from 'react';

import { GlobalStyles } from '@contentful/f36-core';
import tokens from '@contentful/f36-tokens';
import { MountOptions, MountReturn, mount as cyMount } from '@cypress/react';
import { Global } from '@emotion/core';

function TestStyles() {
  return <Global styles={{ body: { padding: tokens.spacingM } }} />;
}

export function mount(
  node: React.ReactNode,
  options?: MountOptions
): Cypress.Chainable<MountReturn> {
  return cyMount(
    <>
      <GlobalStyles withNormalize={true} />
      <TestStyles />
      {node}
    </>,
    options
  );
}
