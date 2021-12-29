import { PlateEditor } from '@udecode/plate-core';
import { NodeEntry, Text, Node, Element } from 'slate';
import { NodeTransformer } from '.';

import { NodeValidator } from './types';

export class NormalizerError extends Error {}

export const createValidatorFromTypes =
  (types: string[]): NodeValidator =>
  (_, [node]) => {
    return Element.isElement(node) && types.includes(node.type);
  };

export const getChildren = (editor: PlateEditor, [node, path]: NodeEntry): NodeEntry[] => {
  if (Text.isText(node)) {
    return [];
  }

  return Array.from(Node.children(editor, path));
};

export const createTransformerFromObject = (
  transforms: Record<string, NodeTransformer>
): NodeTransformer => {
  // A default transformer must always be provided
  const fallback = transforms['default'];

  if (!fallback) {
    throw new NormalizerError('A default transformer MUST be provided');
  }

  return (editor, entry) => {
    const [node] = entry;
    const key = Element.isElement(node) ? node.type : 'default';

    const transformer = transforms[key] || fallback;

    return transformer(editor, entry);
  };
};
