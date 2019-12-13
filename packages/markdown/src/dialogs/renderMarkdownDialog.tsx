import React from 'react';
import { DialogExtensionSDK } from 'contentful-ui-extensions-sdk';
import { MarkdownDialogsParams, MarkdownDialogType } from '../types';
import { SpecialCharacterModalDialog } from './SpecialCharacterModalDialog';
import { CheatsheetModalDialog } from './CheatsheetModalDialog';
import { InsertLinkModal } from './InsertLinkModalDialog';
import { InsertTableModal } from './InsertTableModalDialog';
import { EmbedExternalContentModal } from './EmdebExternalContentDialog';

export const renderMarkdownDialog = (
  sdk: DialogExtensionSDK & { parameters: { invocation: MarkdownDialogsParams } }
) => {
  const parameters = sdk.parameters.invocation;
  if (parameters.type === MarkdownDialogType.cheatsheet) {
    return <CheatsheetModalDialog />;
  } else if (parameters.type === MarkdownDialogType.insertLink) {
    const selectedText = parameters.selectedText;
    return <InsertLinkModal selectedText={selectedText} onClose={sdk.close} />;
  } else if (parameters.type === MarkdownDialogType.insertSpecialCharacter) {
    return <SpecialCharacterModalDialog onClose={sdk.close} />;
  } else if (parameters.type === MarkdownDialogType.insertTable) {
    return <InsertTableModal onClose={sdk.close} />;
  } else if (parameters.type === MarkdownDialogType.embedExternalContent) {
    return <EmbedExternalContentModal onClose={sdk.close} />;
  }
  return <div />;
};
