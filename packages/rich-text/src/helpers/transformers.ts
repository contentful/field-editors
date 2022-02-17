import { BLOCKS, INLINES, TEXT_CONTAINERS } from '@contentful/rich-text-types';
import { PlateEditor } from '@udecode/plate-core';
import { Element, NodeEntry, Transforms } from 'slate';

export const transformRemove = (editor: PlateEditor, [, path]: NodeEntry) => {
  Transforms.removeNodes(editor, { at: path });
};

export const transformParagraphs = (editor: PlateEditor, entry: NodeEntry) => {
  const path = entry[1];

  Transforms.setNodes(
    editor,
    {
      type: BLOCKS.PARAGRAPH,
    },
    {
      at: path,
      mode: 'all',
      match: (node) => Element.isElement(node) && TEXT_CONTAINERS.includes(node.type as BLOCKS),
    }
  );
};

export const transformUnwrap = (editor: PlateEditor, [, path]: NodeEntry) => {
  Transforms.unwrapNodes(editor, {
    at: path,
  });
};

export const transformWrapIn =
  (type: BLOCKS | INLINES) =>
  (editor: PlateEditor, [, path]: NodeEntry) => {
    Transforms.wrapNodes(editor, { type, data: {}, children: [] }, { at: path });
  };

export const transformLift = (editor: PlateEditor, [, path]: NodeEntry) => {
  Transforms.liftNodes(editor, { at: path });
};
