import { OpenMarkdownDialogParams, MarkdownDialogsParams } from '../types';
import * as ModalLauncher from './ModalDialogLauncher';
import { CheatsheetModalContent } from './CheatsheetModalContent';

export const openMarkdownDialog = (options: OpenMarkdownDialogParams<MarkdownDialogsParams>) => {
  if (options.parameters?.type === 'cheatsheet') {
    return ModalLauncher.openDialog(options, CheatsheetModalContent);
  }
  return Promise.reject();
};
