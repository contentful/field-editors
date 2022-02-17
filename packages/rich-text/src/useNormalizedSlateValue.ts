import { useMemo } from 'react';

import { toSlatejsDocument } from '@contentful/contentful-slatejs-adapter';
import { EMPTY_DOCUMENT } from '@contentful/rich-text-types';
import { createPlateEditor } from '@udecode/plate-core';
import { Transforms } from 'slate';

import schema from './constants/Schema';
import { disableCorePlugins } from './plugins';
import { RichTextPlugin } from './types';

export type NormalizedSlateValueProps = {
  id: string;
  incomingDoc: unknown;
  plugins: RichTextPlugin[];
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
      document: incomingDoc || EMPTY_DOCUMENT,
      schema,
    });

    // Sets editor value & kicks normalization
    Transforms.insertNodes(editor, doc);

    // TODO: return the editor itself to avoid recompiling & initializing all
    // of the plugins again. It's currently not possible due to a bug in Plate
    // with initialValues
    // See: https://slate-js.slack.com/archives/C013QHXSCG1/p1645112799942819
    return editor.children;
  }, [id, plugins, incomingDoc]);
};
