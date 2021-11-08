import { PlatePlugin } from '@udecode/plate-core';
import { isFirstChild } from '../../helpers/editor';
import { ExitBreakPluginOptions, createExitBreakPlugin } from '@udecode/plate-break';

export function createInsertBeforeFirstVoidBlockPlugin(): PlatePlugin {
  const optionsExitBreakPlugin: ExitBreakPluginOptions = {
    rules: [
      {
        hotkey: 'enter',
        before: true,
        query: { filter: ([node, path]) => isFirstChild(path) && !!node.isVoid },
      },
      {
        hotkey: 'enter',
        query: { filter: ([node, path]) => !isFirstChild(path) && !!node.isVoid },
      },
    ],
  };

  return createExitBreakPlugin(optionsExitBreakPlugin);
}
