import { MARKS } from '@contentful/rich-text-types';
import { isMarkActive, toggleMark } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';

export const buildMarkEventHandler = (type: MARKS) => (editor, plugin) => (event) => {
  if (!editor.selection || !isHotkey(plugin?.options?.hotkey, event)) return;

  event.preventDefault();

  const isActive = isMarkActive(editor, type);
  editor.tracking?.onShortcutAction(isActive ? 'unmark' : 'mark', { markType: type });

  toggleMark(editor, { key: type as string });
};
