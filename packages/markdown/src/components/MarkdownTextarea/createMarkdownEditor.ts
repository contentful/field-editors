/* eslint-disable @typescript-eslint/no-explicit-any */

import { EditorDirection } from '../../types.js';
import * as CodeMirrorWrapper from './CodeMirrorWrapper.js';
import * as Commands from './MarkdownCommands.js';

export function createMarkdownEditor(
  host: HTMLElement,
  options: {
    direction: EditorDirection;
    readOnly: boolean;
    fixedHeight?: number | boolean;
    height?: number | string;
  }
) {
  const editor = CodeMirrorWrapper.create(host, options);

  function wrapChange(fn: Function) {
    return (e: any, ch: any) => {
      fn(editor.getValue(), e, ch);
    };
  }

  const api = {
    actions: Commands.create(editor),
    history: {
      hasUndo: function () {
        // @ts-expect-error
        return editor.getHistorySize('undo') > 0;
      },
      hasRedo: function () {
        // @ts-expect-error
        return editor.getHistorySize('redo') > 0;
      },
    },
    events: {
      onScroll: function (fn: Function) {
        editor.attachEvent('scroll', fn, 150);
      },
      onChange: function (fn: Function) {
        editor.attachEvent('change', wrapChange(fn), 0);
      },
      onPaste: function (fn: Function) {
        editor.attachEvent('paste', fn, 0);
      },
    },
    insert: editor.insertAtCursor,
    focus: editor.focus,
    getContent: editor.getValue,
    destroy: editor.destroy,
    setContent: editor.setValue,
    getSelectedText: editor.getSelectedText,
    usePrimarySelection: editor.usePrimarySelection,
    setReadOnly: editor.setReadOnly,
    selectBackwards: editor.selectBackwards,
    getCursor: editor.getCursor,
    setCursor: editor.setCursor,
    clear: () => editor.setValue(''),
    selectAll: editor.selectAll,
    setFullsize: editor.setFullsize,
    refresh: editor.refresh,
  };

  editor.addKeyShortcuts({
    B: api.actions.bold,
    I: api.actions.italic,
  });

  return api;
}
