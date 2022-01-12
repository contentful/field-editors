import { BLOCKS } from '@contentful/rich-text-types';
import { HotkeyPlugin, KeyboardHandler, PlateEditor } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { Transforms, Element, Editor } from 'slate';

import { isBlockSelected } from '../../helpers/editor';

export function toggleQuote(editor: PlateEditor): void {
  if (!editor.selection) return;

  const isActive = isBlockSelected(editor, BLOCKS.QUOTE);

  Editor.withoutNormalizing(editor, () => {
    Transforms.unwrapNodes(editor, {
      match: (node) => Element.isElement(node) && node.type === BLOCKS.QUOTE,
      split: true,
    });

    if (!isActive) {
      const quote = {
        type: BLOCKS.QUOTE,
        data: {},
        children: [],
      };

      Transforms.wrapNodes(editor, quote);
    }
  });
}

export const onKeyDownToggleQuote: KeyboardHandler<{}, HotkeyPlugin> =
  (editor, plugin) => (event) => {
    const { hotkey } = plugin.options;

    if (hotkey && isHotkey(hotkey, event)) {
      event.preventDefault();
      toggleQuote(editor);
    }
  };
