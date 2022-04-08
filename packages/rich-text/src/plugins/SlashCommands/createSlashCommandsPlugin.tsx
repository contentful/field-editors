// import debounce from 'lodash/debounce';

import { RichTextPlugin } from '../../types';
import { closePanel, openPanel } from './helpers';

const SLASH_COMMANDS_PLUGIN_KEY = 'SlashCommands';

// TODO: Explore a solution using marks and ReactDOM.createPortal to activate the commands panel
export function createSlashCommandsPlugin(): RichTextPlugin {
  return {
    key: SLASH_COMMANDS_PLUGIN_KEY,
    type: SLASH_COMMANDS_PLUGIN_KEY,
    handlers: {
      onClick: (editor) => () => {
        closePanel(editor.id);
      },
      onKeyDown: (editor) => (event) => {
        closePanel(editor.id);

        if (event.key === '/') {
          openPanel(editor.id);
        }
      },
    },
  };
}
