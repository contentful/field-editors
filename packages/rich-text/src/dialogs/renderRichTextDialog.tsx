import React from 'react';

import { DialogExtensionSDK } from '@contentful/app-sdk';

import { HyperlinkDialog } from './HypelinkDialog/HyperlinkDialog';

export const renderRichTextDialog = (sdk: DialogExtensionSDK) => {
  const parameters = sdk.parameters.invocation as Record<string, unknown>;
  if (parameters?.type === 'rich-text-hyperlink-dialog') {
    sdk.window.startAutoResizer();
    return <HyperlinkDialog {...sdk.parameters.invocation} onClose={sdk.close} sdk={sdk} />;
  }
  return <div />;
};
