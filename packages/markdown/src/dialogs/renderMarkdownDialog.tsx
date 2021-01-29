import React from 'react';
import { DialogExtensionSDK } from '@contentful/app-sdk';
import { MarkdownDialogsParams, MarkdownDialogType } from '../types';
import { SpecialCharacterModalDialog } from './SpecialCharacterModalDialog';
import { CheatsheetModalDialog } from './CheatsheetModalDialog';
import { InsertLinkModal } from './InsertLinkModalDialog';
import { InsertTableModal } from './InsertTableModalDialog';
import { EmbedExternalContentModal } from './EmdebExternalContentDialog';
import { ConfirmInsertAssetModalDialog } from './ConfirmInsertAssetModalDialog';
import { ZenModeModalDialog } from './ZenModeModalDialog';

export const renderMarkdownDialog = (
  sdk: DialogExtensionSDK & { parameters: { invocation: MarkdownDialogsParams } }
) => {
  const parameters = sdk.parameters.invocation;
  if (parameters.type === MarkdownDialogType.cheatsheet) {
    sdk.window.startAutoResizer();
    return <CheatsheetModalDialog />;
  } else if (parameters.type === MarkdownDialogType.insertLink) {
    const selectedText = parameters.selectedText;
    sdk.window.startAutoResizer();
    return <InsertLinkModal selectedText={selectedText} onClose={sdk.close} />;
  } else if (parameters.type === MarkdownDialogType.insertSpecialCharacter) {
    sdk.window.startAutoResizer();
    return <SpecialCharacterModalDialog onClose={sdk.close} />;
  } else if (parameters.type === MarkdownDialogType.insertTable) {
    sdk.window.startAutoResizer();
    return <InsertTableModal onClose={sdk.close} />;
  } else if (parameters.type === MarkdownDialogType.embedExternalContent) {
    sdk.window.startAutoResizer();
    return <EmbedExternalContentModal onClose={sdk.close} />;
  } else if (parameters.type === MarkdownDialogType.confirmInsertAsset) {
    const locale = parameters.locale;
    const assets = parameters.assets;
    sdk.window.startAutoResizer();
    return <ConfirmInsertAssetModalDialog onClose={sdk.close} locale={locale} assets={assets} />;
  } else if (parameters.type === MarkdownDialogType.zenMode) {
    const locale = parameters.locale;
    const initialValue = parameters.initialValue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sdk.window.updateHeight('100%' as any);
    return (
      <ZenModeModalDialog
        onClose={sdk.close}
        saveValueToSDK={() => {
          // don't save changes in dialog mode
        }}
        initialValue={initialValue}
        locale={locale}
        sdk={sdk}
      />
    );
  }

  return <div />;
};
