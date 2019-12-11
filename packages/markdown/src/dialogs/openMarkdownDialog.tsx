import React from 'react';
import { OpenMarkdownDialogParams, MarkdownDialogsParams } from '../types';
import * as ModalLauncher from './ModalDialogLauncher';
import { CheatsheetModalDialog } from './CheatsheetModalDialog';
import { InsertLinkModal, InsertLinkModalResult } from './InsertLinkModalDialog';

export const openMarkdownDialog = (options: OpenMarkdownDialogParams<MarkdownDialogsParams>) => {
  if (options.parameters?.type === 'cheatsheet') {
    return ModalLauncher.openDialog(options, () => {
      return <CheatsheetModalDialog />;
    });
  } else if (options.parameters?.type === 'insertLink') {
    const selectedText = options.parameters.selectedText;
    return ModalLauncher.openDialog<InsertLinkModalResult>(options, ({ onClose }) => {
      return <InsertLinkModal selectedText={selectedText} onClose={onClose} />;
    });
  }
  return Promise.reject();
};
