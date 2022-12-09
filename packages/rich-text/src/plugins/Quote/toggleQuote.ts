// @ts-nocheck
import { BLOCKS } from '@contentful/rich-text-types';
import { HotkeyPlugin, KeyboardHandler, PlateEditor } from '@udecode/plate-core';
import { withoutNormalizing } from 'internal';
import isHotkey from 'is-hotkey';
import { Transforms, Element } from 'slate';

import { isBlockSelected } from '../../helpers/editor';
import { TrackingPluginActions } from '../../plugins/Tracking';
import { CustomElement, RichTextEditor } from '../../types';

export function toggleQuote(
  editor: PlateEditor,
  logAction?: TrackingPluginActions['onShortcutAction'] | TrackingPluginActions['onToolbarAction']
): void {
  if (!editor.selection) return;

  const isActive = isBlockSelected(editor, BLOCKS.QUOTE);

  logAction?.(isActive ? 'remove' : 'insert', { nodeType: BLOCKS.QUOTE });

  withoutNormalizing(editor, () => {
    if (!editor.selection) return;

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

      Transforms.wrapNodes(editor, quote);
    }
  });
}

export const onKeyDownToggleQuote: KeyboardHandler<RichTextEditor, HotkeyPlugin> =
  (editor, plugin) => (event) => {
    const { hotkey } = plugin.options;

    if (hotkey && isHotkey(hotkey, event)) {
      event.preventDefault();
      toggleQuote(editor, editor.tracking.onShortcutAction);
    }
  };
