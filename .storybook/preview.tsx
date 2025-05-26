import { GlobalStyles } from '@contentful/f36-core';
import tokens from '@contentful/f36-tokens';
import { styled } from '@storybook/theming';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import * as React from 'react';
i18n.activate('en-US');

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
        <I18nProvider i18n={i18n}>
          <Story />
        </I18nProvider>
      </div>
    ),
  ],
};

export default preview;
