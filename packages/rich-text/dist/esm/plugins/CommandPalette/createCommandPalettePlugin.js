import { CommandPrompt } from './components/CommandPrompt';
import { COMMAND_PROMPT } from './constants';
import { createOnKeyDown } from './onKeyDown';
export const createCommandPalettePlugin = ()=>{
    return {
        key: COMMAND_PROMPT,
        type: COMMAND_PROMPT,
        isLeaf: true,
        component: CommandPrompt,
        handlers: {
            onKeyDown: createOnKeyDown()
        }
    };
};
