import { GlobalStyles } from '@contentful/f36-core';

export const decorators = [
  (Story) => (
    <div>
      <GlobalStyles />
      <Story />
    </div>
  ),
];
