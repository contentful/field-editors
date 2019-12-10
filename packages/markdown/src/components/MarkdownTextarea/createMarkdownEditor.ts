import isFunction from 'lodash/isFunction';
import * as CodeMirrorWrapper from './CodeMirrorWrapper';
import * as Commands from './MarkdownCommands';
import { EditorDirection } from '../../types';

export function createMarkdownEditor(
  host: HTMLElement,
  options: {
    direction: EditorDirection;
    readOnly: boolean;
  }
) {
  const editor = CodeMirrorWrapper.create(host, options);

  function wrapChange(fn: Function) {
    return (e: any, ch: any) => {
      fn(editor.getValue(), e, ch);
    };
  }

  function tiePreviewToEditor(el: any) {
    const fraction = editor.getScrollFraction();

    window.requestAnimationFrame(() => {
      const top = el.get(0).scrollHeight * fraction;
      el.scrollTop(top);
    });
  }

  function tieEditorToEditor(other: any) {
    other = isFunction(other.getWrapper) ? other.getWrapper() : other;
    other.restoreCursor(editor.getCurrentCharacter(), editor.getCurrentLineNumber());
    other.setHistory(editor.getHistory());
  }

  /**
   * Scroll the editor so that its scroll position matches that of the
   * given preview element.
   */
  function tieEditorToPreview(previewElement: any) {
    // We use the scroll fraction because the scroll height of the editor
    // might differ from the scroll height of the preview element.
    const height = previewElement.get(0).scrollHeight;
    const top = previewElement.scrollTop();
    const position = height === 0 ? 0 : top / height;

    window.requestAnimationFrame(() => {
      editor.scrollToFraction(position);
    });
  }

  const api = {
    actions: Commands.create(editor),
    history: {
      hasUndo: function() {
        return editor.getHistorySize('undo') > 0;
      },
      hasRedo: function() {
        return editor.getHistorySize('redo') > 0;
      }
    },
    events: {
      onScroll: function(fn: Function) {
        editor.attachEvent('scroll', fn, 150);
      },
      onChange: function(fn: Function) {
        editor.attachEvent('change', wrapChange(fn), 0);
      },
      onPaste: function(fn: Function) {
        editor.attachEvent('paste', fn, 0);
      }
    },
    tie: {
      previewToEditor: tiePreviewToEditor,
      editorToEditor: tieEditorToEditor,
      editorToPreview: tieEditorToPreview
    },
    insert: editor.insertAtCursor,
    focus: editor.focus,
    getContent: editor.getValue,
    destroy: editor.destroy,
    setContent: editor.setValue,
    getSelectedText: editor.getSelectedText,
    usePrimarySelection: editor.usePrimarySelection,
    setReadOnly: editor.setReadOnly,
    selectBackwards: editor.selectBackwards
  };

  editor.addKeyShortcuts({
    B: api.actions.bold,
    I: api.actions.italic
  });

  return api;
}
