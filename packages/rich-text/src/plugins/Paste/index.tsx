import { PlateEditor } from '@udecode/plate-core';
import flow from 'lodash/flow';

import { RichTextPlugin } from '../../types';
import * as sanitizers from './sanitizers';

const MIME_TYPE_HTML = 'text/html';

// TODO: Upgrade tslib so we can just flow(...sanitizers);
const sanitizeDocument = flow.apply(this, Object.values(sanitizers));

const sanitizeHtml = (html: string, editor: PlateEditor): string => {
  const doc = new DOMParser().parseFromString(html, MIME_TYPE_HTML);
  const [sanitizedDoc] = sanitizeDocument([doc, editor]);
  const sanitizedData = new XMLSerializer().serializeToString(sanitizedDoc);
  return sanitizedData;
};

const htmlToDataTransfer = (html: string): DataTransfer => {
  const data = new DataTransfer();
  data.setData(MIME_TYPE_HTML, html);
  return data;
};

export const createPastePlugin = (): RichTextPlugin => ({
  key: 'PastePlugin',
  withOverrides: (editor) => {
    const { insertData } = editor;
    editor.insertData = (data: DataTransfer) => {
      const html = data.getData(MIME_TYPE_HTML);
      if (html) {
        const sanitized = sanitizeHtml(html, editor);
        const newData = htmlToDataTransfer(sanitized);
        insertData(newData);
      } else {
        insertData(data);
      }
    };

    return editor;
  },
});
