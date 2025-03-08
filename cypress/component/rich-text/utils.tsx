import React from 'react';

import { RichTextEditor } from '../../../packages/rich-text/src';
import { createRichTextFakeSdk } from '../../fixtures';
import { mount } from '../mount';
import { RichTextPage } from './RichTextPage';

type MountRichTextEditorOptions = Partial<React.ComponentProps<typeof RichTextEditor>>;

export const mountRichTextEditor = (options: MountRichTextEditorOptions = {}): void => {
  const { sdk, isInitiallyDisabled = false } = options;
  const rtSDK = sdk || createRichTextFakeSdk();

  mount(<RichTextEditor sdk={rtSDK} isInitiallyDisabled={isInitiallyDisabled} {...options} />);
};

export const focusEditorAndType = (richText: RichTextPage, content: string): void => {
  richText.editor.click();
  richText.editor.should('be.focused');
  richText.editor.type(content);
};
