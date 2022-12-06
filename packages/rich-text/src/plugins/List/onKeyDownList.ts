/**
 * Credit: Modified version of Plate's list plugin
 * See: https://github.com/udecode/plate/blob/main/packages/nodes/list
 */
import { getAboveNode, HotkeyPlugin, KeyboardHandler } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import castArray from 'lodash/castArray';

import { RichTextEditor } from '../../types';
import { moveListItems } from './transforms/moveListItems';
import { toggleList } from './transforms/toggleList';

// eslint-disable-next-line -- TODO: check this
// @ts-ignore
export const onKeyDownList: KeyboardHandler<RichTextEditor, HotkeyPlugin> =
  (editor, { type, options: { hotkey } }) =>
  (e) => {
    if (e.key === 'Tab' && editor.selection) {
      // eslint-disable-next-line -- TODO: check this
      // @ts-ignore
      const listSelected = getAboveNode(editor, {
        at: editor.selection,
        match: { type },
      });

      if (listSelected) {
        e.preventDefault();
        // eslint-disable-next-line -- TODO: check this
        // @ts-ignore
        moveListItems(editor, { increase: !e.shiftKey });
        return;
      }
    }

    if (!hotkey) return;

    const hotkeys = castArray(hotkey);

    for (const _hotkey of hotkeys) {
      // eslint-disable-next-line -- TODO: check this
      // @ts-ignore
      if (isHotkey(_hotkey)(e)) {
        // eslint-disable-next-line -- TODO: check this
        // @ts-ignore
        toggleList(editor, { type });
      }
    }
  };
