// modified version of native setAlign plugin that can be found at
// https://github.com/udecode/plate/blob/main/packages/nodes/alignment/src/transforms/setAlign.ts

import {
  getPluginInjectProps,
  PlateEditor,
  PlatePluginKey,
  setNodes,
  SetNodesOptions,
  TNodeMatch,
  unsetNodes,
} from '@udecode/plate-core';
import { Alignment, KEY_ALIGN } from '@udecode/plate-alignment';
import { ALIGNMENT } from '../types';

export const setAlign = (
  editor: PlateEditor,
  {
    key = KEY_ALIGN,
    value,
    setNodesOptions,
  }: { value: Alignment; setNodesOptions?: SetNodesOptions } & PlatePluginKey
) => {
  const { validTypes, defaultNodeValue, nodeKey } = getPluginInjectProps(editor, key);

  const match: TNodeMatch = (n) => {
    // console.log({validTypes})
    // console.log({type: n.type})
    // console.log(!!validTypes && validTypes.includes(n.type))
    return !!validTypes && validTypes.includes(n.type);
  }

  if (value === defaultNodeValue) {
    unsetNodes(editor, nodeKey!, {
      match,
      ...setNodesOptions,
    });
  } else {
    setNodes(
      editor,
      { [nodeKey!]: value },
      {
        match: match as any,
        ...setNodesOptions,
      }
    );
  }
};
