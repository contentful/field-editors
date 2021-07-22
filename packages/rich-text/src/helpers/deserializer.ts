import { getSlatePluginOptions, SPEditor } from '@udecode/slate-plugins-core';
import { getLeafDeserializer } from '@udecode/slate-plugins-common';
import { MARKS } from '@contentful/rich-text-types';

const leafRules = {
  [MARKS.BOLD]: [
    { nodeNames: ['STRONG'] },
    {
      style: {
        fontWeight: ['600', '700', 'bold'],
      },
    },
  ],
};

export function deserializeLeaf(editor: SPEditor, type: string, options = {}) {
  const pluginOptions = getSlatePluginOptions(editor, type);

  return {
    leaf: getLeafDeserializer({
      rules: leafRules[type],
      ...pluginOptions,
      ...options,
    }),
  };
}
