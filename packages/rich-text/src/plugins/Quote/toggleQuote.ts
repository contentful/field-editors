import { BLOCKS } from '@contentful/rich-text-types';
import { HotkeyPlugin, KeyboardHandler } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { Transforms, Element, Editor } from 'slate';

import { isBlockSelected } from '../../helpers/editor';
import { TrackingPluginActions } from '../../plugins/Tracking';
import { CustomElement, RichTextEditor } from '../../types';

export function toggleQuote(
  editor: RichTextEditor,
  logAction: TrackingPluginActions['onShortcutAction'] | TrackingPluginActions['onToolbarAction']
): void {
  if (!editor.selection) return;

  const isActive = isBlockSelected(editor, BLOCKS.QUOTE);

  logAction(isActive ? 'remove' : 'insert', { nodeType: BLOCKS.QUOTE });

  Editor.withoutNormalizing(editor, () => {
    if (!editor.selection) return;

    Transforms.unwrapNodes(editor, {
      match: (node) => Element.isElement(node) && (node as CustomElement).type === BLOCKS.QUOTE,
      split: true,
    });

    const { anchor, focus } = editor.selection;
    const isTripleSelection =
      anchor.path[0] !== focus.path[0] && anchor.offset === 0 && focus.offset === 0;

    if (!isActive) {
      const quote = {
        type: BLOCKS.QUOTE,
        data: {},
        children: [],
      };

      Transforms.wrapNodes(editor, quote, {
        at: isTripleSelection ? editor.selection.anchor : undefined,
      });
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
