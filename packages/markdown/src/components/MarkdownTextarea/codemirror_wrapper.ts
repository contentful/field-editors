// @ts-nocheck
/* eslint-disable @typescript-eslint/no-use-before-define */

import transform from 'lodash/transform';
import throttle from 'lodash/throttle';
import * as CodeMirror from 'codemirror';
import * as userAgent from '../../utils/userAgent';

export function create(textarea, options) {
  const { direction, fixedHeight, height } = options || {};

  // Set to true if `setValue()` has been called. This is to prevent
  // undoing the initial content.
  let initializedWithValue = false;

  const LF = '\n';

  const EDITOR_SIZE = {
    min: height || 300,
    max: 500,
    shift: 50
  };

  // TODO We should call `new CodeMirror()` instead of using the textarea.
  const cm = CodeMirror.fromTextArea(textarea, {
    direction,
    mode: 'markdown',
    lineNumbers: false,
    undoDepth: 200,
    matchBrackets: true,
    lineWrapping: true,
    theme: 'elegant',
    // When `lineSeparator === null` the document will be split
    // on CRLFs as well as lone CRs and LFs. A single LF will
    // be used as line separator in all output
    lineSeparator: null,
    tabSize: 2,
    indentWithTabs: false,
    indentUnit: 2
  });

  cm.setSize('100%', EDITOR_SIZE.min);

  if (!fixedHeight) {
    cm.on('change', throttle(assureHeight, 150));
  }

  cm.setOption('extraKeys', {
    Tab: function() {
      replaceSelectedText(getIndentation());
    },
    Enter: 'newlineAndIndentContinueMarkdownList',
    Esc: () => {
      cm.getInputField().blur();
    }
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
    getHistorySize,
    getHistory: () => cm.getHistory(),
    setHistory: history => cm.setHistory(history),

    scrollToFraction,
    getScrollFraction
  };

  function destroy() {
    cm.toTextArea();
    // todo: unwatch resize
    // unwatchResize();
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

  function attachEvent(name, fn, throttleInterval) {
    if (throttleInterval) {
      fn = throttle(fn, throttleInterval);
    }
    cm.on(name, fn);
  }

  function addKeyShortcuts(map) {
    const ctrlKey = userAgent.getCtrlKey();
    cm.addKeyMap(
      transform(
        map,
        (acc, value, key) => {
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
   * @param {string?} value
   * @description
   * Sets the content of the editor while preserving the cursor
   * position.
   *
   * If called for the first time it will not record the change in
   * the history.
   */
  function setValue(value) {
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

  function cmd(name) {
    cm.execCommand(name);
    cm.focus();
  }

  function moveToLineBeginning(lineNumber) {
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

  function restoreCursor(character, lineNumber, noFocus) {
    cm.setCursor({ line: defaultToCurrentLineNumber(lineNumber), ch: character }, null, {
      scroll: !noFocus
    });
    if (!noFocus) {
      cm.focus();
    }
  }

  function moveToLineEnd(lineNumber) {
    cm.setCursor({
      line: defaultToCurrentLineNumber(lineNumber),
      ch: getCurrentLineLength()
    });
    cm.focus();
  }

  function defaultToCurrentLineNumber(lineNumber) {
    if (lineNumber === 0 || lineNumber > 0) {
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

  function select(from, to) {
    cm.setSelection(from, to);
    cm.focus();
  }

  function selectBackwards(skip, len) {
    select(getPos(-skip - len), getPos(-skip));

    function getPos(modifier) {
      return {
        line: getCurrentLineNumber(),
        ch: getCurrentCharacter() + modifier
      };
    }
  }

  function extendSelectionBy(modifier) {
    select(getPos('anchor', 0), getPos('head', modifier));

    function getPos(prop, modifier) {
      const selection = getSelection();
      return { line: selection[prop].line, ch: selection[prop].ch + modifier };
    }
  }

  function insertAtCursor(text) {
    cm.replaceRange(text, cm.getCursor());
    cm.focus();
  }

  function insertAtLineBeginning(text) {
    const initialCh = getCurrentCharacter();
    moveToLineBeginning();
    insertAtCursor(text);
    restoreCursor(initialCh + text.length);
    cm.focus();
  }

  function wrapSelection(wrapper) {
    const replacement = wrapper + getSelectedText() + wrapper;
    const selection = getSelection();
    cm.replaceRange(replacement, selection.anchor, selection.head);
    cm.focus();
  }

  function removeFromLineBeginning(charCount) {
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
   *
   * @param {string} replacement
   * @param {string?} select
   */
  function replaceSelectedText(replacement, select) {
    cm.replaceSelection(replacement, select);
    cm.focus();
  }

  /**
   *  low-level editor get/check functions
   */

  function getCursor() {
    return cm.getCursor();
  }

  function setCursor(cursor) {
    cm.setCursor(cursor);
  }

  function getSelection() {
    const selections = cm.listSelections();
    if (!cm.somethingSelected() || !selections || selections.length < 1) {
      return null;
    }
    return selections[0];
  }

  function getLine(lineNumber) {
    return cm.getLine(lineNumber) || '';
  }

  function isLineEmpty(lineNumber) {
    const n = defaultToCurrentLineNumber(lineNumber);
    return n > -1 && getLine(n).length < 1 && n < cm.lineCount();
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

  function lineStartsWith(text) {
    return getCurrentLine().startsWith(text);
  }

  function getIndentation() {
    return repeat(' ', cm.getOption('indentUnit'));
  }

  function getNl(n) {
    if (n < 1) {
      return '';
    }
    return repeat(LF, n || 1);
  }

  function getValue() {
    return cm.getValue() || '';
  }

  function getHistorySize(which) {
    const history = cm.historySize();
    return which ? history[which] : history;
  }

  /**
   * @description
   * Returns the scroll postition has a fraction of the overall height.
   *
   * @returns {number}
   */
  function getScrollFraction() {
    const info = cm.getScrollInfo();
    return info.top / info.height;
  }

  function repeat(what, n) {
    return new Array(n + 1).join(what);
  }

  /**
   * @description
   * Given a number between 0 and 1 this method scrolls to the given fraction
   * of the document
   *
   * @param {number} position
   */
  function scrollToFraction(pos) {
    const height = cm.getScrollInfo().height;
    cm.scrollTo(null, pos * height);
  }
}
