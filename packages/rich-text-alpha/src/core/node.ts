import { keydownHandler } from 'prosemirror-keymap';
import type { NodeSpec } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';
import { Plugin, PluginKey, EditorState } from 'prosemirror-state';

import { lazyHandler } from './utils';

export abstract class Node extends Plugin {
  constructor() {
    super({
      key: new PluginKey(new.target.name),
    });
  }

  /**
   * The unique name of the node. It must be alphanumeric and may contain
   * underscore characters.
   */
  abstract readonly name: string;

  abstract readonly schema: NodeSpec;

  /**
   * Modifiers can be given in any order. `Shift-` (or `s-`), `Alt-` (or
   * `a-`), `Ctrl-` (or `c-` or `Control-`) and `Cmd-` (or `m-` or `Meta-`)
   * are recognized. For characters that are created by holding shift, the
   * `Shift-` prefix is implied, and should not be added explicitly.
   *
   * You can use `Mod-` as a shorthand for `Cmd-` on Mac and `Ctrl-` on
   * other platforms.
   */
  shortcuts: Record<string, Command> = {};

  props: Plugin['props'] = {
    handleKeyDown: lazyHandler(() => keydownHandler(this.shortcuts)),
  };

  /**
   * Access node type from state
   */
  type = (state: EditorState) => {
    return state.schema.nodes[this.name];
  };
}
