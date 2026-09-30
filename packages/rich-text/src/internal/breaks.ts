import type * as React from 'react';

import isHotkey from 'is-hotkey';
import { PathApi, queryNode } from 'platejs';

import type {
  PlatePlugin,
  KeyboardHandler,
  ExitBreakRule,
  SoftBreakRule,
  ResetNodePluginRule
} from './types/plugins';

export type { ExitBreakRule, SoftBreakRule, ResetNodePluginRule } from './types/plugins';
export type ResetNodePlugin = { rules: ResetNodePluginRule[] };
export const KEY_SOFT_BREAK = 'softBreak';
export const KEY_EXIT_BREAK = 'exitBreak';
export const SIMULATE_BACKSPACE: React.KeyboardEvent = {
  key: 'Backspace',
  which: 8,
  keyCode: 8,
  preventDefault() {}
} as React.KeyboardEvent;

export const onKeyDownResetNode: KeyboardHandler<ResetNodePlugin> =
  (editor, { options }) =>
  (event) => {
    for (const rule of options.rules) {
      if ((rule.hotkey && !isHotkey(rule.hotkey, event)) || !rule.predicate(editor)) continue;
      const entry = editor.api.block({ match: { type: rule.types } });
      if (!entry) continue;
      event.preventDefault();
      editor.tf.setNodes({ type: rule.defaultType }, { at: entry[1] });
      rule.onReset?.(editor);
      return true;
    }
    return undefined;
  };
export const createResetNodePlugin = (config: Partial<PlatePlugin>): PlatePlugin => ({
  key: 'resetNode',
  ...config,
  handlers: { onKeyDown: onKeyDownResetNode }
});
export const createSoftBreakPlugin = (config: Partial<PlatePlugin>): PlatePlugin => ({
  key: KEY_SOFT_BREAK,
  ...config,
  handlers: {
    onKeyDown:
      (editor, { options }) =>
      (event) => {
        for (const rule of options.rules as SoftBreakRule[]) {
          if (isHotkey(rule.hotkey, event) && queryNode(editor.api.block(), rule.query)) {
            event.preventDefault();
            editor.tf.insertSoftBreak();
            return true;
          }
        }
        return undefined;
      }
  }
});
export const createExitBreakPlugin = (config: Partial<PlatePlugin>): PlatePlugin => ({
  key: KEY_EXIT_BREAK,
  ...config,
  handlers: {
    onKeyDown:
      (editor, { options }) =>
      (event) => {
        if (!editor.selection) return;
        for (const rule of options.rules as ExitBreakRule[]) {
          const entry = editor.api.block();
          if (!entry || !isHotkey(rule.hotkey, event) || !queryNode(entry, rule.query)) continue;
          const atStart = editor.api.isStart(editor.selection.anchor, entry[1]);
          const atEnd = editor.api.isEnd(editor.selection.anchor, entry[1]);
          if (
            (rule.query?.start || rule.query?.end) &&
            !(rule.query.start && atStart) &&
            !(rule.query.end && atEnd)
          )
            continue;
          const path = editor.selection.anchor.path.slice(0, (rule.level ?? 0) + 1);
          const at = rule.before || (rule.query?.start && atStart) ? path : PathApi.next(path);
          event.preventDefault();
          editor.tf.insertNodes(
            { type: editor.getType('p'), children: [{ text: '' }] },
            { at, select: true }
          );
          return true;
        }
        return undefined;
      }
  }
});
