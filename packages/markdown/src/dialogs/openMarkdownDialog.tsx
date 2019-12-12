import React from 'react';
import { OpenMarkdownDialogParams, MarkdownDialogsParams } from '../types';
import * as ModalLauncher from './ModalDialogLauncher';
import { CheatsheetModalDialog } from './CheatsheetModalDialog';
import { SpecialCharacterModalDialog } from './SpecialCharacterModalDialog';
import { MarkdownDialogType } from '../types';
import { InsertLinkModal, InsertLinkModalResult } from './InsertLinkModalDialog';
import { InsertTableModal, InsertTableModalResult } from './InsertTableModalDialog';

export const openMarkdownDialog = (options: OpenMarkdownDialogParams<MarkdownDialogsParams>) => {
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
  }
  return Promise.reject();
};
