import { NodeEntry, Transforms } from 'slate';
import { PlateEditor } from '@udecode/plate-core';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';

import { extractInlineOrText, extractParagraphs } from './extractNodes';

export const transformRemove = (editor: PlateEditor, [, path]: NodeEntry) => {
  Transforms.removeNodes(editor, { at: path });
};

export const transformParagraphs = (editor: PlateEditor, entry: NodeEntry) => {
  const path = entry[1];
  const nodes = extractParagraphs(editor, path);

  transformRemove(editor, entry);
  Transforms.insertNodes(editor, nodes, { at: path });
};

export const transformInlineOrText = (editor: PlateEditor, entry: NodeEntry) => {
  const path = entry[1];
  const nodes = extractInlineOrText(editor, path);

  transformRemove(editor, entry);
  Transforms.insertNodes(editor, nodes, { at: path });
};

export const transformWrapIn =
  (type: BLOCKS | INLINES) =>
  (editor: PlateEditor, [, path]: NodeEntry) => {
    Transforms.wrapNodes(editor, { type, data: {}, children: [] }, { at: path });
  };

export const transformLift = (editor: PlateEditor, [, path]: NodeEntry) => {
  Transforms.liftNodes(editor, { at: path });
};
