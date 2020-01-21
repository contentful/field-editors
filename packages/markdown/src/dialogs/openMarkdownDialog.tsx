import React from 'react';
import { FieldExtensionSDK, DialogExtensionSDK } from 'contentful-ui-extensions-sdk';
import { OpenMarkdownDialogParams, MarkdownDialogsParams, PreviewComponents } from '../types';
import * as ModalLauncher from './ModalDialogLauncher';
import { CheatsheetModalDialog } from './CheatsheetModalDialog';
import { SpecialCharacterModalDialog } from './SpecialCharacterModalDialog';
import { MarkdownDialogType } from '../types';
import { InsertLinkModal, InsertLinkModalResult } from './InsertLinkModalDialog';
import { InsertTableModal, InsertTableModalResult } from './InsertTableModalDialog';
import { ConfirmInsertAssetModalDialog } from './ConfirmInsertAssetModalDialog';
import {
  EmbedExternalContentModal,
  EmbedExternalContentModalResult
} from './EmdebExternalContentDialog';
import { ZenModeModalDialog, ZenModeResult } from './ZenModeModalDialog';

export const openMarkdownDialog = (
  sdk: FieldExtensionSDK,
  previewComponents?: PreviewComponents
) => (options: OpenMarkdownDialogParams<MarkdownDialogsParams>) => {
  if (options.parameters?.type === MarkdownDialogType.cheatsheet) {
    return ModalLauncher.openDialog(options, () => {
      return <CheatsheetModalDialog />;
    });
  } else if (options.parameters?.type === MarkdownDialogType.insertLink) {
    const selectedText = options.parameters.selectedText;
    return ModalLauncher.openDialog<InsertLinkModalResult>(options, ({ onClose }) => {
      return <InsertLinkModal selectedText={selectedText} onClose={onClose} />;
    });
  } else if (options.parameters?.type === MarkdownDialogType.insertSpecialCharacter) {
    return ModalLauncher.openDialog(options, ({ onClose }) => {
      return <SpecialCharacterModalDialog onClose={onClose} />;
    });
  } else if (options.parameters?.type === MarkdownDialogType.insertTable) {
    return ModalLauncher.openDialog<InsertTableModalResult>(options, ({ onClose }) => {
      return <InsertTableModal onClose={onClose} />;
    });
  } else if (options.parameters?.type === MarkdownDialogType.embedExternalContent) {
    return ModalLauncher.openDialog<EmbedExternalContentModalResult>(options, ({ onClose }) => {
      return <EmbedExternalContentModal onClose={onClose} />;
    });
  } else if (options.parameters?.type === MarkdownDialogType.confirmInsertAsset) {
    const locale = options.parameters.locale;
    const assets = options.parameters.assets;
    return ModalLauncher.openDialog<boolean>(options, ({ onClose }) => {
      return <ConfirmInsertAssetModalDialog onClose={onClose} locale={locale} assets={assets} />;
    });
  } else if (options.parameters?.type === MarkdownDialogType.zenMode) {
    const initialValue = options.parameters.initialValue;
    const locale = options.parameters.locale;
    return ModalLauncher.openDialog<ZenModeResult>(options, ({ onClose }) => {
      return (
        <ZenModeModalDialog
          saveValueToSDK={value => {
            if (value) {
              return sdk.field.setValue(value);
            }
            return sdk.field.removeValue();
          }}
          onClose={onClose}
          initialValue={initialValue}
          locale={locale}
          sdk={(sdk as unknown) as DialogExtensionSDK}
          previewComponents={previewComponents}
        />
      );
    });
  }
  return Promise.reject();
};
