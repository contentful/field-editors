import { BLOCKS } from '@contentful/rich-text-types';
import { PlateEditor } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { Transforms, Element, Editor } from 'slate';

import { isBlockSelected } from '../../helpers/editor';
import { TrackingPluginActions } from '../../plugins/Tracking';
import { CustomElement } from '../../types';

export function toggleQuote(
  editor: PlateEditor,
  logAction?: TrackingPluginActions['onShortcutAction'] | TrackingPluginActions['onToolbarAction']
): void {
  if (!editor.selection) return;

  const isActive = isBlockSelected(editor, BLOCKS.QUOTE);

  logAction?.(isActive ? 'remove' : 'insert', { nodeType: BLOCKS.QUOTE });

  // TODO check this

  // @ts-ignore
  Editor.withoutNormalizing(editor, () => {
    if (!editor.selection) return;

    // TODO check this

    // @ts-ignore
    Transforms.unwrapNodes(editor, {
      match: (node) => Element.isElement(node) && (node as CustomElement).type === BLOCKS.QUOTE,
      split: true,
    });

    if (!isActive) {
      const quote = {
        type: BLOCKS.QUOTE,
        data: {},
        children: [],
      };

      // TODO check this

      // @ts-ignore
      Transforms.wrapNodes(editor, quote);
    }
  });
}

// TODO check this

// @ts-ignore
export const onKeyDownToggleQuote = (editor, plugin) => (event) => {
  const { hotkey } = plugin.options;

  // TODO check this

  // @ts-ignore
  if (hotkey && isHotkey(hotkey, event)) {
    event.preventDefault();

    // TODO check this

    // @ts-ignore
    toggleQuote(editor, editor.tracking.onShortcutAction);
  }
};
