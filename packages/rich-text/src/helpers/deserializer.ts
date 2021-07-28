import {
  getSlatePluginOptions,
  SPEditor,
  Deserialize,
  GetNodeDeserializerRule,
} from '@udecode/slate-plugins-core';
import { getLeafDeserializer, getElementDeserializer } from '@udecode/slate-plugins-common';

export function deserializeLeaf(type: string, rules: GetNodeDeserializerRule[]): Deserialize {
  return function (editor: SPEditor) {
    const pluginOptions = getSlatePluginOptions(editor, type);

    return {
      leaf: getLeafDeserializer({
        type,
        rules,
        ...pluginOptions.deserialize,
      }),
    };
  };
}

export function deserializeElement(type: string, rules: GetNodeDeserializerRule[]): Deserialize {
  return function (editor: SPEditor) {
    const pluginOptions = getSlatePluginOptions(editor, type);

    return {
      element: getElementDeserializer({
        type,
        rules,
        ...pluginOptions.deserialize,
      }),
    };
  };
}
