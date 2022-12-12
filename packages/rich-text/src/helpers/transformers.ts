// @ts-nocheck
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { NodeEntry, Transforms } from 'slate';

import { insertNodes } from '../internal/transforms';
import { RichTextEditor } from '../types';
import { extractParagraphs } from './extractNodes';

export const transformRemove = (editor: RichTextEditor, [, path]: NodeEntry) => {
  Transforms.removeNodes(editor, { at: path });
};

export const transformParagraphs = (editor: RichTextEditor, entry: NodeEntry) => {
  const path = entry[1];
  const nodes = extractParagraphs(editor, path);

  transformRemove(editor, entry);
  insertNodes(editor, nodes, { at: path });
};

export const transformUnwrap = (editor: RichTextEditor, [, path]: NodeEntry) => {
  Transforms.unwrapNodes(editor, {
    at: path,
  });
};

export const transformWrapIn =
  (type: BLOCKS | INLINES) =>
  (editor: RichTextEditor, [, path]: NodeEntry) => {
    Transforms.wrapNodes(editor, { type, data: {}, children: [] }, { at: path });
  };

export const transformLift = (editor: RichTextEditor, [, path]: NodeEntry) => {
  Transforms.liftNodes(editor, { at: path });
};
