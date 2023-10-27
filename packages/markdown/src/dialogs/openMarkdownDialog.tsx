import * as React from 'react';

import { DialogAppSDK, FieldAppSDK, OpenCustomWidgetOptions } from '@contentful/app-sdk';
import { ModalDialogLauncher } from '@contentful/field-editor-shared';

import { MarkdownDialogType, MarkdownDialogsParams, PreviewComponents } from '../types.js';
import { CheatsheetModalDialog } from './CheatsheetModalDialog.js';
import { ConfirmInsertAssetModalDialog } from './ConfirmInsertAssetModalDialog.js';
import {
  EmbedExternalContentModal,
  EmbedExternalContentModalResult,
} from './EmdebExternalContentDialog.js';
import { InsertLinkModal, InsertLinkModalResult } from './InsertLinkModalDialog.js';
import { InsertTableModal, InsertTableModalResult } from './InsertTableModalDialog.js';
import { SpecialCharacterModalDialog } from './SpecialCharacterModalDialog.js';
import { ZenModeModalDialog, ZenModeResult } from './ZenModeModalDialog.js';

export const openMarkdownDialog =
  (sdk: FieldAppSDK, previewComponents?: PreviewComponents) =>
  (
    options: OpenCustomWidgetOptions & {
      parameters?: MarkdownDialogsParams;
    }
  ) => {
    if (options.parameters?.type === MarkdownDialogType.cheatsheet) {
      return ModalDialogLauncher.openDialog(options, () => {
        return <CheatsheetModalDialog />;
      });
    } else if (options.parameters?.type === MarkdownDialogType.insertLink) {
      const selectedText = options.parameters.selectedText;
      return ModalDialogLauncher.openDialog<InsertLinkModalResult>(options, ({ onClose }) => {
        return <InsertLinkModal selectedText={selectedText} onClose={onClose} />;
      });
    } else if (options.parameters?.type === MarkdownDialogType.insertSpecialCharacter) {
      return ModalDialogLauncher.openDialog(options, ({ onClose }) => {
        return <SpecialCharacterModalDialog onClose={onClose} />;
      });
    } else if (options.parameters?.type === MarkdownDialogType.insertTable) {
      return ModalDialogLauncher.openDialog<InsertTableModalResult>(options, ({ onClose }) => {
        return <InsertTableModal onClose={onClose} />;
      });
    } else if (options.parameters?.type === MarkdownDialogType.embedExternalContent) {
      return ModalDialogLauncher.openDialog<EmbedExternalContentModalResult>(
        options,
        ({ onClose }) => {
          return <EmbedExternalContentModal onClose={onClose} />;
        }
      );
    } else if (options.parameters?.type === MarkdownDialogType.confirmInsertAsset) {
      const locale = options.parameters.locale;
      const assets = options.parameters.assets;
      return ModalDialogLauncher.openDialog<boolean>(options, ({ onClose }) => {
        return <ConfirmInsertAssetModalDialog onClose={onClose} locale={locale} assets={assets} />;
      });
    } else if (options.parameters?.type === MarkdownDialogType.zenMode) {
      const initialValue = options.parameters.initialValue;
      const locale = options.parameters.locale;
      return ModalDialogLauncher.openDialog<ZenModeResult>(options, ({ onClose }) => {
        return (
          <ZenModeModalDialog
            saveValueToSDK={(value) => {
              if (value) {
                return sdk?.field?.setValue(value);
              }
              return sdk?.field?.removeValue();
            }}
            onClose={onClose}
            initialValue={initialValue}
            locale={locale}
            sdk={sdk as unknown as DialogAppSDK}
            previewComponents={previewComponents}
          />
        );
      });
    }
    return Promise.reject();
  };
