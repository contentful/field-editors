import { NodeEntry, Text, Node } from 'slate';
import { PlateEditor, match } from '@udecode/plate-core';

export class NormalizerError extends Error {}

export const createValidatorFromArray =
  (types: string[]) =>
  (_: PlateEditor, [node]: NodeEntry) =>
    match(node, { type: types });

export const getChildren = (editor: PlateEditor, [node, path]: NodeEntry): NodeEntry[] => {
  if (Text.isText(node)) {
    return [];
  }

  return Array.from(Node.children(editor, path));
};
