import React from 'react';

import { RichTextEditor } from '../../../packages/rich-text/src';
import { createRichTextFakeSdk } from '../../fixtures';
import { mount } from '../mount';

interface MountRichTextEditorOptions extends Partial<React.ComponentProps<typeof RichTextEditor>> {
  sdfsdf?: boolean;
}

export const mountRichTextEditor = (options: MountRichTextEditorOptions = {}): void => {
  const { sdk, actionsDisabled = false, isInitiallyDisabled = false, onAction } = options;
  const rtSDK = sdk || createRichTextFakeSdk();

  mount(
    <RichTextEditor
      sdk={rtSDK}
      isInitiallyDisabled={isInitiallyDisabled}
      actionsDisabled={actionsDisabled}
      onAction={onAction}
    />
  );
};
