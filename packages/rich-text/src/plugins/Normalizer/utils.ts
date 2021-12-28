import { PlateEditor } from '@udecode/plate-core';
import { NodeEntry, Text, Node, Element } from 'slate';

export class NormalizerError extends Error {}

export const createValidatorFromTypes =
  (types: string[]) =>
  (_: PlateEditor, [node]: NodeEntry) => {
    return Element.isElement(node) && types.includes(node.type);
  };

export const getChildren = (editor: PlateEditor, [node, path]: NodeEntry): NodeEntry[] => {
  if (Text.isText(node)) {
    return [];
  }

  return Array.from(Node.children(editor, path));
};
