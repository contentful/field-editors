import { useMemo } from 'react';

import { toSlatejsDocument } from '@contentful/contentful-slatejs-adapter';
import { EMPTY_DOCUMENT, Document } from '@contentful/rich-text-types';
import { createPlateEditor } from '@udecode/plate-core';
import { Editor } from 'slate';

import schema from './constants/Schema';
import { disableCorePlugins } from './plugins';
import { RichTextPlugin } from './types';

export type NormalizedSlateValueProps = {
  id: string;
  incomingDoc: any;
  plugins: RichTextPlugin[];
};

/**
 * For legacy reasons, a document may not have any content at all
 * e.g:
 *
 * {nodeType: document, data: {}, content: []}
 *
 * Rendering such document will break the Slate editor
 */
const hasContent = (doc?: Document) => {
  if (!doc) {
    return false;
  }

  return doc.content.length > 0;
};

export const useNormalizedSlateValue = ({
  id,
  incomingDoc,
  plugins,
}: NormalizedSlateValueProps) => {
  return useMemo(() => {
    const editor = createPlateEditor({
      id,
      plugins,
      disableCorePlugins,
    });

    const doc = toSlatejsDocument({
      document: hasContent(incomingDoc) ? incomingDoc : EMPTY_DOCUMENT,
      schema,
    });

    // Sets editor value & kicks normalization
    editor.children = doc;
    Editor.normalize(editor, { force: true });

    // TODO: return the editor itself to avoid recompiling & initializing all
    // of the plugins again. It's currently not possible due to a bug in Plate
    // with initialValues
    // See: https://slate-js.slack.com/archives/C013QHXSCG1/p1645112799942819
    return editor.children;
  }, [id, plugins, incomingDoc]);
};
