/**
 * Credit: Modified version of Plate's list plugin
 * See: https://github.com/udecode/plate/blob/main/packages/nodes/list
 */
import { HotkeyPlugin } from '@udecode/plate-common';
import isHotkey from 'is-hotkey';

import { getAboveNode } from '../../internal/queries';
import { KeyboardHandler } from '../../internal/types';
import { moveListItems } from './transforms/moveListItems';
import { toggleList } from './transforms/toggleList';

export const onKeyDownList: KeyboardHandler<HotkeyPlugin> =
  (editor, { type, options: { hotkey } }) =>
  (e) => {
    if (e.key === 'Tab' && editor.selection) {
      const listSelected = getAboveNode(editor, {
        at: editor.selection,
        match: { type },
      });

      if (listSelected) {
        e.preventDefault();
        moveListItems(editor, { increase: !e.shiftKey });
        return;
      }
    }

    if (!hotkey) return;

    const hotkeys = Array.isArray(hotkey) ? hotkey : [hotkey];

    for (const _hotkey of hotkeys) {
      if (isHotkey(_hotkey)(e)) {
        toggleList(editor, { type });
      }
    }
  };
