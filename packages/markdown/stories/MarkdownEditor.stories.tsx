/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';

import { Notification } from '@contentful/f36-components';
import { ActionsPlayground, createFakeFieldAPI } from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { assets } from '../src/__fixtures__/fixtures';
import '../src/codemirrorImports';
import { openMarkdownDialog } from '../src/dialogs/openMarkdownDialog';
import { MarkdownEditorConnected as MarkdownEditor } from '../src/MarkdownEditor';

import 'codemirror/lib/codemirror.css';

const meta: Meta<typeof MarkdownEditor> = {
  title: 'editors/Markdown',
  component: MarkdownEditor,
};

export default meta;

type Story = StoryObj<typeof MarkdownEditor>;

declare global {
  interface Window {
    markdownEditor: any;
  }
}

export const Default: Story = {
  render: () => {
    const initialValue = window.localStorage.getItem('initialValue');
    const isInitiallyDisabled = !!window.localStorage.getItem('initialDisabled');
    const [field, mitt] = createFakeFieldAPI((field) => field, initialValue);

    const sdk = {
      field,
      locales: {
        default: 'en-US',
        fallbacks: {
          'en-US': undefined,
        },
        optional: {
          'en-US': false,
        },
        direction: {
          'en-US': 'ltr',
        },
      },
      dialogs: {
        selectMultipleAssets: () => {
          alert('select multiple assets dialog');

          return [assets.published];
        },
      },
      notifier: {
        success: (text) => Notification.success(text),
        error: (text) => Notification.error(text),
      },
      navigator: {
        openNewAsset: async () => {
          alert('open new asset');

          return {
            entity: assets.created,
          };
        },
      },
      window: {
        updateHeight: () => {},
        startAutoResizer: () => {},
      },
      access: {
        can: (access, entity) => {
          if (access === 'create' && entity === 'Asset') {
            return Promise.resolve(true);
          }
          return Promise.resolve(false);
        },
      },
    };
    // @ts-expect-error
    sdk.dialogs.openCurrent = openMarkdownDialog(sdk);

    return (
      <div data-test-id="markdown-editor-integration-test">
        <MarkdownEditor
          sdk={sdk}
          onReady={(editor) => {
            window.markdownEditor = editor;
          }}
          // @ts-expect-error
          parameters={sdk.parameters}
          isInitiallyDisabled={isInitiallyDisabled ?? false}
        />
        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};
