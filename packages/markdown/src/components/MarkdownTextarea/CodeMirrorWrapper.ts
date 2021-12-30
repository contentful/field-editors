/* eslint-disable @typescript-eslint/no-use-before-define, @typescript-eslint/no-explicit-any */

import transform from 'lodash/transform';
import throttle from 'lodash/throttle';
import CodeMirror from 'codemirror';
import * as userAgent from '../../utils/userAgent';
import { EditorDirection } from '../../types';

function stripUnit(value: number | string): number {
  if (typeof value !== 'string') return value;

  const cssRegex = /^([+-]?(?:\d+|\d*\.\d+))([a-z]*|%)$/;
  const matchedValue = value.match(cssRegex);

  if (!matchedValue) {
    throw new Error("Couldn't match unit in given string");
  }

  return parseFloat(value);
}

export function create(
  host: HTMLElement,
  options: {
    direction: EditorDirection;
    readOnly: boolean;
    fixedHeight?: number | boolean;
    height?: number | string;
  }
) {
  const { direction, fixedHeight, height, readOnly } = options || {};

  // Set to true if `setValue()` has been called. This is to prevent
  // undoing the initial content.
  let initializedWithValue = false;

  const LF = '\n';

  const EDITOR_SIZE = {
    min: height ? stripUnit(height) : 300,
    max: 500,
    shift: 50,
  };

  // eslint-disable-next-line
  // @ts-ignore
  const cm = CodeMirror(host, {
    direction,
    readOnly,
    mode: 'markdown',
    lineNumbers: false,
    undoDepth: 200,
    matchBrackets: true,
    lineWrapping: true,
    // When `lineSeparator === null` the document will be split
    // on CRLFs as well as lone CRs and LFs. A single LF will
    // be used as line separator in all output
    lineSeparator: null,
    theme: 'elegant',
    tabSize: 2,
    indentWithTabs: false,
    indentUnit: 2,
    autoRefresh: true,
  });

  cm.setSize('100%', EDITOR_SIZE.min);

  if (!fixedHeight) {
    cm.on('change', throttle(assureHeight, 150));
  }

  cm.setOption('extraKeys', {
    Tab: function () {
      replaceSelectedText(getIndentation());
    },
    Enter: 'newlineAndIndentContinueMarkdownList',
    Esc: () => {
      cm.getInputField().blur();
    },
  });

  /**
   * @description
   * Custom API for a CodeMirror instance.
   *
   * An instance wraps a CodeMirror instance and provides a custom interface
   * on top of CodeMirror.
   */
  return {
    destroy,
    disable,
    enable,
    attachEvent,
    addKeyShortcuts,
    setValue,
    cmd,
    moveToLineBeginning,
    moveIfNotEmpty,
    restoreCursor,
    moveToLineEnd,
    usePrimarySelection,
    focus,
    select,
    selectBackwards,
    selectAll: () => cm.execCommand('selectAll'),
    extendSelectionBy,
    insertAtCursor,
    insertAtLineBeginning,
    wrapSelection,
    removeFromLineBeginning,
    removeSelectedText,
    replaceSelectedText,
    getCursor,
    setCursor,
    getSelection,
    getLine,
    isLineEmpty,
    getSelectedText,
    getSelectionLength,
    getCurrentLine,
    getCurrentLineNumber,
    getCurrentCharacter,
    getCurrentLineLength,
    lineStartsWith,
    getIndentation,
    getNl,
    getValue,
    getLinesCount,
    getHistorySize,
    setReadOnly: (value: boolean) => cm.setOption('readOnly', value),
    getHistory: () => cm.getHistory(),
    setHistory: (history: any) => cm.setHistory(history),
    setFullsize: () => {
      cm.setSize('100%', '100%');
      cm.refresh();
    },
    refresh: () => cm.refresh(),
  };

  function destroy() {
    // @ts-expect-error
    cm.toTextArea();
  }

  function disable() {
    cm.setOption('readOnly', 'nocursor');
  }

  function enable() {
    cm.setOption('readOnly', false);
  }

  function assureHeight() {
    const current = cm.heightAtLine(cm.lastLine(), 'local') + EDITOR_SIZE.shift;
    let next = current;
    if (current < EDITOR_SIZE.min) {
      next = EDITOR_SIZE.min;
    }
    if (current > EDITOR_SIZE.max) {
      next = EDITOR_SIZE.max;
    }
    cm.setSize('100%', next);
  }

  function attachEvent(name: string, fn: Function, throttleInterval: number) {
    if (throttleInterval) {
      fn = throttle(fn as any, throttleInterval);
    }
    cm.on(name, fn as any);
  }

  function addKeyShortcuts(map: any) {
    const ctrlKey = userAgent.getCtrlKey();
    cm.addKeyMap(
      transform(
        map,
        (acc, value, key) => {
          // eslint-disable-next-line
          // @ts-ignore
          acc[ctrlKey + '-' + key] = value;
        },
        {}
      )
    );
  }

  /**
   * low-level editor manipulation functions
   */

  /**
   * @description
   * Sets the content of the editor while preserving the cursor
   * position.
   *
   * If called for the first time it will not record the change in
   * the history.
   */
  function setValue(value?: string) {
    value = value || '';
    if (getValue() === value) {
      return;
    }

    // set value, but save cursor position first
    // position will be restored, but w/o focus (third arg)
    const line = getCurrentLineNumber();
    const ch = getCurrentCharacter();
    cm.setValue(value);
    restoreCursor(ch, line, true);

    // We do not want to record the initial population in the
    // history. Otherwise it would always be possible to revert to
    // the empty string.
    if (!initializedWithValue) {
      cm.clearHistory();
      initializedWithValue = true;
    }
  }

  function cmd(name: string) {
    cm.execCommand(name);
    cm.focus();
  }

  function moveToLineBeginning(lineNumber?: number) {
    cm.setCursor({ line: defaultToCurrentLineNumber(lineNumber), ch: 0 });
    cm.focus();
  }

  /**
   * @description
   * Insert a new line below the cursor and move to the beginning of
   * that line.
   *
   * Only do this if the editor has content and we are not already on
   * the last line.
   *
   * TODO rename this
   */
  function moveIfNotEmpty() {
    if (getCurrentLineLength() < 1) {
      return;
    }

    const next = getCurrentLineNumber() + 1;
    if (cm.lastLine() < next) {
      moveToLineEnd();
      insertAtCursor(getNl());
    }

    moveToLineBeginning(next);
  }

  function restoreCursor(character: number, lineNumber?: number, noFocus?: boolean) {
    cm.setCursor(defaultToCurrentLineNumber(lineNumber), character, {
      scroll: !noFocus,
    });
    if (!noFocus) {
      cm.focus();
    }
  }

  function moveToLineEnd(lineNumber?: number) {
    cm.setCursor({
      line: defaultToCurrentLineNumber(lineNumber),
      ch: getCurrentLineLength(),
    });
    cm.focus();
  }

  function defaultToCurrentLineNumber(lineNumber?: number) {
    if (lineNumber === 0 || (lineNumber !== undefined && lineNumber > 0)) {
      return lineNumber;
    }
    return getCurrentLineNumber();
  }

  function usePrimarySelection() {
    cmd('singleSelection');
  }

  function focus() {
    cm.focus();
  }

  function select(from: CodeMirror.Position, to: CodeMirror.Position) {
    cm.setSelection(from, to);
    cm.focus();
  }

  function selectBackwards(skip: number, len: number) {
    select(getPos(-skip - len), getPos(-skip));

    function getPos(modifier: number) {
      return {
        line: getCurrentLineNumber(),
        ch: getCurrentCharacter() + modifier,
      };
    }
  }

  function extendSelectionBy(modifier: number) {
    select(getPos('anchor', 0), getPos('head', modifier));

    function getPos(prop: 'anchor' | 'head', modifier: number): CodeMirror.Position {
      const selection = getSelection();
      if (!selection) {
        return { line: 0, ch: 0 };
      }
      return { line: selection[prop].line, ch: selection[prop].ch + modifier };
    }
  }

  function insertAtCursor(text: string) {
    cm.replaceRange(text, cm.getCursor());
    cm.focus();
  }

  function insertAtLineBeginning(text: string) {
    const initialCh = getCurrentCharacter();
    moveToLineBeginning();
    insertAtCursor(text);
    restoreCursor(initialCh + text.length);
    cm.focus();
  }

  function wrapSelection(wrapper: string) {
    const replacement = wrapper + getSelectedText() + wrapper;
    const selection = getSelection();
    if (selection) {
      cm.replaceRange(replacement, selection.anchor, selection?.head);
      cm.focus();
    }
  }

  function removeFromLineBeginning(charCount: number) {
    const lineNumber = getCurrentLineNumber();
    cm.replaceRange('', { line: lineNumber, ch: 0 }, { line: lineNumber, ch: charCount });
    cm.focus();
  }

  function removeSelectedText() {
    cm.replaceSelection('');
    cm.focus();
  }

  /**
   * @description
   * Replace the selected text with the given string.
   *
   * If nothing is selected it will insert the text at the current
   * cursor position
   *
   * The optional `select` parameter controls what will be selected
   * afters wards. By default the cursor will be at the end of the
   * inserted text. You can pass 'around' to select the inserted
   * text.
   */
  function replaceSelectedText(replacement: string, select?: string) {
    cm.replaceSelection(replacement, select);
    cm.focus();
  }

  /**
   *  low-level editor get/check functions
   */

  function getCursor() {
    return cm.getCursor();
  }

  function setCursor(cursor: number | CodeMirror.Position) {
    cm.setCursor(cursor);
  }

  function getSelection() {
    const selections = cm.listSelections();
    if (!cm.somethingSelected() || !selections || selections.length < 1) {
      return null;
    }
    return selections[0];
  }

  function getLine(lineNumber: number) {
    return cm.getLine(lineNumber) || '';
  }

  function isLineEmpty(lineNumber?: number) {
    const n = defaultToCurrentLineNumber(lineNumber);
    return n > -1 && getLine(n).length < 1 && n < cm.lineCount();
  }

  function getLinesCount() {
    return cm.lineCount();
  }

  function getSelectedText() {
    return getSelection() ? cm.getSelection() : '';
  }

  function getSelectionLength() {
    return getSelectedText().length;
  }

  function getCurrentLine() {
    return getLine(getCurrentLineNumber());
  }

  function getCurrentLineNumber() {
    return cm.getCursor().line;
  }

  function getCurrentCharacter() {
    return cm.getCursor().ch;
  }

  function getCurrentLineLength() {
    return getCurrentLine().length;
  }

  function lineStartsWith(text: string) {
    return getCurrentLine().startsWith(text);
  }

  function getIndentation() {
    return repeat(' ', cm.getOption('indentUnit') ?? 0);
  }

  function getNl(n = 1) {
    if (n < 1) {
      return '';
    }
    return repeat(LF, n);
  }

  function getValue() {
    return cm.getValue() || '';
  }

  function getHistorySize(which?: 'undo' | 'redo') {
    const history = cm.historySize();
    return which ? history[which] : history;
  }

  function repeat(what: string, n: number) {
    return new Array(n + 1).join(what);
  }
}
