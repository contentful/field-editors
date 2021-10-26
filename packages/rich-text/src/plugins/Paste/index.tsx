import { PlatePlugin, SPEditor } from '@udecode/plate-core';
import * as sanitizers from './sanitizers';
import flow from 'lodash/flow';

const MIME_TYPE_HTML = 'text/html';

// TODO: Upgrade tslib so we can just flow(...sanitizers);
const sanitizeDocument = flow.apply(this, Object.values(sanitizers));

const sanitizeHtml = (html: string, editor: SPEditor): string => {
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

function withPasteHandling(editor: SPEditor) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (_event: React.KeyboardEvent) => {
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
  };
}

export const createPastePlugin = (): PlatePlugin => ({
  onKeyDown: withPasteHandling,
});
