import { getSlatePluginOptions, SPEditor, Deserialize } from '@udecode/slate-plugins-core';
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
  [MARKS.CODE]: [
    { nodeNames: ['CODE', 'PRE'] },
    {
      style: {
        fontFamily: ['monospace'],
      },
    },
  ],
};

export function deserializeLeaf(type: string, options = {}): Deserialize {
  return function (editor: SPEditor) {
    const pluginOptions = getSlatePluginOptions(editor, type);

    return {
      leaf: getLeafDeserializer({
        rules: leafRules[type],
        ...pluginOptions,
        ...options,
      }),
    };
  };
}
