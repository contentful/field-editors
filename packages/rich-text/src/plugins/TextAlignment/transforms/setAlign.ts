import {
    getPluginInjectProps,
    PlateEditor,
    PlatePluginKey,
    setNodes,
    SetNodesOptions,
    TNodeMatch,
    unsetNodes,
  } from '@udecode/plate-core';
  import { KEY_ALIGN } from '@udecode/plate-alignment';
  import { ALIGNMENT } from '../types';
  
  export const setAlign = (
    editor: PlateEditor,
    {
      key = KEY_ALIGN,
      value,
      setNodesOptions,
    }: { value: ALIGNMENT; setNodesOptions?: SetNodesOptions } & PlatePluginKey
  ) => {
    const { validTypes, defaultNodeValue, nodeKey } = getPluginInjectProps(
      editor,
      key
    );
  
    const match: TNodeMatch = (n) =>
        !!validTypes && validTypes.includes(n.type);
  
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