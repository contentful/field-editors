import { toggleMark } from 'prosemirror-commands';
import { keydownHandler } from 'prosemirror-keymap';
import type { MarkSpec } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';
import { Plugin, PluginKey, EditorState } from 'prosemirror-state';

import { lazyHandler } from './utils';

export abstract class Mark extends Plugin {
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

  abstract readonly schema: MarkSpec;

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
   * Access mark type from state
   */
  markType = (state: Pick<EditorState, 'schema'>) => {
    return state.schema.marks[this.name];
  };

  /**
   * Check if the current selection has this mark.
   */
  isActive = (state: EditorState): boolean => {
    const type = this.markType(state);
    const { from, $from, to, empty } = state.selection;

    if (empty) {
      return !!type.isInSet(state.storedMarks || $from.marks());
    }

    return state.doc.rangeHasMark(from, to, type);
  };

  /**
   * Toggle the mark for the current selection.
   */
  toggleMark: Command = (state, dispatch) => {
    const markType = this.markType(state);
    return toggleMark(markType)(state, dispatch);
  };
}
