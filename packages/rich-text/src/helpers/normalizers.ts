import { Editor, NodeEntry, Element } from 'slate';

import { CustomElement } from '../types';

export type Normalizer = (editor: Editor, entry: NodeEntry<CustomElement>) => void;

export const withNormalizer = (editor: Editor, handler: Normalizer) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    if (Element.isElement(entry)) {
      handler(editor, entry as NodeEntry<CustomElement>);
    }

    normalizeNode(entry);
  };
};
