import { useMemo } from 'react';

import { toSlatejsDocument } from '@contentful/contentful-slatejs-adapter';
import { EMPTY_DOCUMENT } from '@contentful/rich-text-types';
import { withPlate } from '@udecode/plate-core';
import { createEditor, Transforms } from 'slate';

import schema from './constants/Schema';
import { disableCorePlugins } from './plugins';
import { withNormalizer } from './plugins/Normalizer/withNormalizer';
import { RichTextPlugin } from './types';

export type NormalizedSlateValueProps = {
  contentfulDoc: unknown;
  plugins: RichTextPlugin[];
};

export const useNormalizedSlateValue = ({ contentfulDoc, plugins }: NormalizedSlateValueProps) => {
  return useMemo(() => {
    const editor = withNormalizer(
      withPlate(createEditor(), {
        id: 'temp',
        plugins,
        disableCorePlugins,
      })
    );

    const doc = toSlatejsDocument({
      document: contentfulDoc || EMPTY_DOCUMENT,
      schema,
    });

    // Sets editor value & kicks normalization
    Transforms.insertNodes(editor, doc);

    return editor.children;
  }, [contentfulDoc, plugins]);
};
