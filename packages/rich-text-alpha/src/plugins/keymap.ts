import { baseKeymap } from 'prosemirror-commands';
import { undo, redo } from 'prosemirror-history';
import { keydownHandler } from 'prosemirror-keymap';
import { Plugin, PluginKey, Command } from 'prosemirror-state';

import { isMac } from '../core';

const keymap: Record<string, Command> = {
  ...baseKeymap,
  'Mod-z': undo,
  'Mod-Shift-z': redo,
};

if (!isMac) {
  keymap['Mod-y'] = redo;
}

export class Keymap extends Plugin {
  constructor() {
    super({
      key: new PluginKey('keymap'),
      props: {
        handleKeyDown: keydownHandler(keymap),
      },
    });
  }
}
