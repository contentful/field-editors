import React from 'react';
import { HyperlinkDialog } from './HypelinkDialog/HyperlinkDialog';

export const renderRichTextDialog = sdk => {
  const parameters = sdk.parameters.invocation;
  if (parameters.type === 'rich-text-hyperlink-dialog') {
    sdk.window.startAutoResizer();
    return <HyperlinkDialog onClose={sdk.close} sdk={sdk} />;
  }
  return <div />;
};
