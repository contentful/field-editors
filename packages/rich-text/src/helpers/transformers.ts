import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { BaseEditor, NodeEntry, Transforms } from 'slate';
import { RichTextEditor } from 'types';

import { extractParagraphs } from './extractNodes';

export const transformRemove = (editor: RichTextEditor, [, path]: NodeEntry) => {
  // TODO check this

  // @ts-ignore
  Transforms.removeNodes(editor, { at: path });
};

export const transformParagraphs = (editor: RichTextEditor, entry: NodeEntry) => {
  const path = entry[1];
  const nodes = extractParagraphs(editor, path);

  transformRemove(editor, entry);
  // TODO check this

  // @ts-ignore
  Transforms.insertNodes(editor, nodes, { at: path });
};

export const transformUnwrap = (editor: RichTextEditor, [, path]: NodeEntry) => {
  // TODO check this

  // @ts-ignore
  Transforms.unwrapNodes(editor, {
    at: path,
  });
};

export const transformWrapIn =
  (type: BLOCKS | INLINES) =>
  (editor: BaseEditor, [, path]: NodeEntry) => {
    Transforms.wrapNodes(editor, { type, data: {}, children: [] }, { at: path });
  };

export const transformLift = (editor: RichTextEditor, [, path]: NodeEntry) => {
  // TODO check this

  // @ts-ignore
  Transforms.liftNodes(editor, { at: path });
};
