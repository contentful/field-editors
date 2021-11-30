import { Editor, NodeEntry, Element } from 'slate';

import { CustomElement } from '../types';

export type Normalizer = (editor: Editor, entry: NodeEntry<CustomElement>) => boolean | undefined;

export const withNormalizer = (editor: Editor, handler: Normalizer) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node] = entry;

    // throw new Error(JSON.stringify(entry, null, 2));
    // console.log(JSON.stringify(entry, null, 2));

    let shouldExitEarly = false;
    if (Element.isElement(node)) {
      shouldExitEarly = !!handler(editor, entry as NodeEntry<CustomElement>);
    }

    if (!shouldExitEarly) {
      normalizeNode(entry);
    }
  };
};
