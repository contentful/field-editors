import { isRootLevel } from '../../helpers/editor';
import { isFirstChildPath } from '../../internal/queries';
import { PlatePlugin } from '../../internal/types';

export const createVoidsPlugin = (): PlatePlugin => ({
  key: 'VoidsPlugin',
  exitBreak: [
    {
      // Inserts a new paragraph *before* a void element if it's the very first
      // node on the editor
      hotkey: 'enter',
      before: true,
      query: {
        filter: ([node, path]) => isRootLevel(path) && isFirstChildPath(path) && !!node.isVoid,
      },
    },
    {
      // Inserts a new paragraph on enter when a void element is focused
      hotkey: 'enter',
      // exploit the internal use of Array.slice(0, level + 1) by the exitBreak plugin
      // to stay in the parent element
      level: -2,
      query: {
        filter: ([node, path]) => !(isRootLevel(path) && isFirstChildPath(path)) && !!node.isVoid,
      },
    },
  ],
});
