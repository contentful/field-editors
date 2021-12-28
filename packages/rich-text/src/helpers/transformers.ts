import { NodeEntry, Transforms } from 'slate';
import { PlateEditor } from '@udecode/plate-core';

import { extractParagraphsAt } from './editor';

export const transformRemove = (editor: PlateEditor, [, path]: NodeEntry) => {
  Transforms.removeNodes(editor, { at: path });
};

export const transformText = (editor: PlateEditor, entry: NodeEntry) => {
  const path = entry[1];
  const textNodes = extractParagraphsAt(editor, path);

  transformRemove(editor, entry);
  Transforms.insertNodes(editor, textNodes, { at: path });
};

export const transformUnwrap = (editor: PlateEditor, [, path]: NodeEntry) => {
  Transforms.unwrapNodes(editor, {
    at: path,
  });
};
