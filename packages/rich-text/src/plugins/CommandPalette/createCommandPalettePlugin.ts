import { RichTextPlugin } from '../../types';
import { CommandPrompt } from './components/CommandPrompt';
import { COMMAND_PROMPT } from './constants';
import { createOnKeyDown } from './onKeyDown';

/**
 * A command palette plugin (aka slash commands)
 *
 * How it works?
 * * TODO
 */
export const createCommandPalettePlugin = (): RichTextPlugin => {
  return {
    key: COMMAND_PROMPT,
    type: COMMAND_PROMPT,
    isLeaf: true,
    component: CommandPrompt,
    handlers: {
      onKeyDown: createOnKeyDown(),
    },
  };
};
