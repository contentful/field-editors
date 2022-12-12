import { BLOCKS, INLINES } from '@contentful/rich-text-types';

import {
  insertNodes,
  removeNodes,
  unwrapNodes,
  wrapNodes,
  liftNodes,
} from '../internal/transforms';
import { PlateEditor, NodeEntry } from '../internal/types';
import { extractParagraphs } from './extractNodes';

export const transformRemove = (editor: PlateEditor, [, path]: NodeEntry) => {
  removeNodes(editor, { at: path });
};

export const transformParagraphs = (editor: PlateEditor, entry: NodeEntry) => {
  const path = entry[1];
  const nodes = extractParagraphs(editor, path);

  transformRemove(editor, entry);
  insertNodes(editor, nodes, { at: path });
};

export const transformUnwrap = (editor: PlateEditor, [, path]: NodeEntry) => {
  unwrapNodes(editor, {
    at: path,
  });
};

export const transformWrapIn =
  (type: BLOCKS | INLINES) =>
  (editor: PlateEditor, [, path]: NodeEntry) => {
    wrapNodes(editor, { type, data: {}, children: [] }, { at: path });
  };

export const transformLift = (editor: PlateEditor, [, path]: NodeEntry) => {
  liftNodes(editor, { at: path });
};
