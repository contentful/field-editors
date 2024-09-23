import React from 'react';

import { RichTextEditor } from '../../../packages/rich-text/src';
import { createRichTextFakeSdk } from '../../fixtures';
import { mount } from '../mount';

type MountRichTextEditorOptions = Partial<React.ComponentProps<typeof RichTextEditor>>;

export const mountRichTextEditor = (options: MountRichTextEditorOptions = {}): void => {
  const { sdk, isInitiallyDisabled = false } = options;
  const rtSDK = sdk || createRichTextFakeSdk();

  mount(<RichTextEditor sdk={rtSDK} isInitiallyDisabled={isInitiallyDisabled} {...options} />);
};
