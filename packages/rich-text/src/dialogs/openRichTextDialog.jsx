import React from 'react';
import { ModalDialogLauncher } from '@contentful/field-editor-shared';
import { HyperlinkDialog } from './HypelinkDialog/HyperlinkDialog';

export const openRichTextDialog = (sdk) => (options) => {
  if (options.parameters && options.parameters.type === 'rich-text-hyperlink-dialog') {
    return ModalDialogLauncher.openDialog(options, ({ onClose }) => {
      return <HyperlinkDialog {...options.parameters} onClose={onClose} sdk={sdk} />;
    });
  }
  return Promise.reject();
};
