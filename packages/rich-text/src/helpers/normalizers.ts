import { Editor, NodeEntry, Element } from 'slate';

import { CustomElement } from '../types';

export type Normalizer = (editor: Editor, entry: NodeEntry<CustomElement>) => boolean | undefined;

/**
 * Injects a custom normalization handler.
 *
 * Handlers must explicity return "true" to indicate a pass.
 * A pass is when a handler didn't encounter any normalization
 * paths (i.e. all nodes were valid)
 */
export const withNormalizer = (editor: Editor, handler: Normalizer) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node] = entry;

    let shouldExitEarly = false;

    if (Element.isElement(node)) {
      shouldExitEarly = handler(editor, entry as NodeEntry<CustomElement>) !== true;
    }

    if (!shouldExitEarly) {
      normalizeNode(entry);
    }
  };
};
