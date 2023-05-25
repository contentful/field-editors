import { GlobalStyles } from '@contentful/f36-core';
import tokens from '@contentful/f36-tokens';
import { styled } from '@storybook/theming';
import React from 'react';

const preview = {
  parameters: {
    docs: {
      components: {
        code: styled.div(() => ({
          margin: '0 3px',
          padding: '4px 6px',
          borderRadius: '3px',
          fontFamily: tokens.fontStackMonospace,
          fontSize: '0.85em',
        })),
        pre: styled.div(() => ({
          fontFamily: tokens.fontStackMonospace,
          fontSize: 14,
          lineHeight: 1.8,
        })),
      },
    },
  },
  decorators: [
    (Story) => (
      <div>
        <GlobalStyles />
        <Story />
      </div>
    ),
  ],
};

export default preview;
