import React from 'react';
import { DialogExtensionSDK } from 'contentful-ui-extensions-sdk';
import { MarkdownDialogsParams } from '../types';

import { CheatsheetModalDialog } from './CheatsheetModalDialog';
import { InsertLinkModal } from './InsertLinkModalDialog';

export const renderMarkdownDialog = (
  sdk: DialogExtensionSDK & { parameters: { invocation: MarkdownDialogsParams } }
) => {
  const parameters = sdk.parameters.invocation;
  if (parameters.type === 'cheatsheet') {
    return <CheatsheetModalDialog />;
  } else if (parameters.type === 'insertLink') {
    const selectedText = parameters.selectedText;
    return <InsertLinkModal selectedText={selectedText} onClose={sdk.close} />;
  }
  return <div />;
};
