import type { FieldAppSDK } from '@contentful/app-sdk';
import { toggleMark } from 'prosemirror-commands';
import { keydownHandler } from 'prosemirror-keymap';
import type { MarkSpec } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';
import { Plugin, PluginKey, EditorState } from 'prosemirror-state';

import { lazyHandler } from './utils';

export abstract class Mark extends Plugin {
  constructor(sdk: FieldAppSDK) {
    super({
      key: new PluginKey(new.target.name),
    });

    this.sdk = sdk;
  }

  /**
   * The unique name of the node. It must be alphanumeric and may contain
   * underscore characters.
   */
  abstract readonly name: string;

  abstract readonly schema: MarkSpec;

  /**
   * The Field SDK instance.
   */
  sdk: FieldAppSDK;

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
  type = (state: Pick<EditorState, 'schema'>) => {
    return state.schema.marks[this.name];
  };

  /**
   * Check if the current selection has this mark.
   */
  isActive = (state: EditorState): boolean => {
    const type = this.type(state);
    const { from, $from, to, empty } = state.selection;

    if (empty) {
      return !!type.isInSet(state.storedMarks || $from.marks());
    }

    return state.doc.rangeHasMark(from, to, type);
  };

  /**
   * Credit:
   * https://discuss.prosemirror.net/t/expanding-the-selection-to-the-active-mark/478/7
   */
  getMarkRange = ({ schema, selection }: EditorState) => {
    const type = this.type({ schema });

    const $pos = selection.$from;

    const { parent, parentOffset } = $pos;
    const start = parent.childAfter(parentOffset);
    if (!start.node) {
      return;
    }

    const mark = start.node.marks.find((mark) => mark.type === type);
    if (!mark) {
      return;
    }

    let startIndex = $pos.index();
    let startPos = $pos.start() + start.offset;
    let endIndex = startIndex + 1;
    let endPos = startPos + start.node.nodeSize;

    while (startIndex > 0 && mark.isInSet(parent.child(startIndex - 1).marks)) {
      startIndex -= 1;
      startPos -= parent.child(startIndex).nodeSize;
    }

    while (endIndex < parent.childCount && mark.isInSet(parent.child(endIndex).marks)) {
      endPos += parent.child(endIndex).nodeSize;
      endIndex += 1;
    }

    return { from: startPos, to: endPos };
  };

  /**
   * Toggle the mark for the current selection.
   */
  toggleMark: Command = (state, dispatch) => {
    const markType = this.type(state);
    return toggleMark(markType)(state, dispatch);
  };
}
