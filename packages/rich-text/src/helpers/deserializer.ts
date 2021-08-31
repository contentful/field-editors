import {
  getPlatePluginOptions,
  SPEditor,
  Deserialize,
  GetNodeDeserializerRule,
} from '@udecode/plate-core';
import { getLeafDeserializer, getElementDeserializer } from '@udecode/plate-common';

export function deserializeLeaf(type: string, rules: GetNodeDeserializerRule[]): Deserialize {
  return function (editor: SPEditor) {
    const pluginOptions = getPlatePluginOptions(editor, type);

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
    const pluginOptions = getPlatePluginOptions(editor, type);

    return {
      element: getElementDeserializer({
        type,
        rules,
        ...pluginOptions.deserialize,
      }),
    };
  };
}
