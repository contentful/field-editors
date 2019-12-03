/* eslint-disable @typescript-eslint/no-use-before-define */

import range from 'lodash/range';
import min from 'lodash/min';
import max from 'lodash/max';
import times from 'lodash/times';
// eslint-disable-next-line you-dont-need-lodash-underscore/repeat
import repeat from 'lodash/repeat';

function createPrefixToggleFn(prefix) {
  return editor => {
    if (editor.lineStartsWith(prefix)) {
      editor.removeFromLineBeginning(prefix.length);
    } else {
      editor.insertAtLineBeginning(prefix);
    }
  };
}

/**
 * Wraps the current selection with a marker.
 *
 * If nothing is selected it inserts the given text wrapped in the
 * marker and selects the inner text
 *
 * Used b the `bold`, `italic`, and `strike` commands.
 */
function wrapSelection(editor, marker, emptyText) {
  return () => {
    editor.usePrimarySelection();

    // there's a selection - wrap it with inline marker
    if (editor.getSelection()) {
      editor.wrapSelection(marker);
    } else {
      // no selection - insert sample text and select it
      editor.insertAtCursor(marker + emptyText + marker);
      editor.selectBackwards(marker.length, emptyText.length);
    }
  };
}

const HEADER_CHAR = '#';
const quoteToggleFn = createPrefixToggleFn('> ');
const codeToggleFn = createPrefixToggleFn('    ');

/**
 * @description
 * A collection of commands used by the user bound to a
 * CodeMirrorWrapper instance.
 *
 * The command collection only depends on the wrapper instance and is
 * used by UI from code mirror stuff.
 */
export function create(editor) {
  return {
    bold: wrapSelection(editor, '__', 'text in bold'),
    italic: wrapSelection(editor, '*', 'text in italic'),
    strike: wrapSelection(editor, '~~', 'striked out'),
    quote: modifySelection(editor, quoteToggleFn),
    code: modifySelection(editor, codeToggleFn),
    link,
    h1: toggleHeader(editor, 1),
    h2: toggleHeader(editor, 2),
    h3: toggleHeader(editor, 3),
    ul: modifySelection(editor, ulToggleFn, true),
    ol: modifySelection(editor, olToggleFn, true),
    undo: function() {
      editor.cmd('undo');
    },
    redo: function() {
      editor.cmd('redo');
    },
    hr,
    indent,
    dedent,
    table
  };

  /**
   * @description
   * Insert a line with `---` below the cursor.
   */
  function hr() {
    editor.moveIfNotEmpty();
    const nl = editor.getNl();
    const markup = nl + '---' + nl + nl;
    editor.insertAtCursor(markup);
  }

  /**
   * @description
   * Indent the current line.
   */
  function indent() {
    editor.insertAtLineBeginning(editor.getIndentation());
  }

  /**
   * @description
   * Dedent the current line.
   */
  function dedent() {
    const indentation = editor.getIndentation();
    if (editor.lineStartsWith(indentation)) {
      editor.removeFromLineBeginning(indentation.length);
    }
  }

  /**
   * @description
   * Insert a markdown table template in a new line.
   *
   * @param {object} config
   * @param {number} config.rows
   * @param {number} config.cols
   */
  function table(config) {
    const nl = editor.getNl();
    editor.moveIfNotEmpty();
    editor.insertAtCursor(nl);
    const line = editor.getCurrentLineNumber();
    editor.insertAtCursor(tableTemplate(config.rows, config.cols).join(nl));
    editor.insertAtCursor(nl + nl);
    editor.restoreCursor(2, line);
  }

  /**
   * @description
   * Inserts or replaces the current selection with a markdown link
   *
   * @param {string} url
   * @param {string?} text
   * @param {string?} title
   */
  function link(url, text, title) {
    editor.usePrimarySelection();

    const linkTitle = title ? ' "' + title + '"' : '';

    const link = text ? '[' + text + '](' + url + linkTitle + ')' : '<' + url + '>';

    editor.replaceSelectedText(link, 'around');
  }
}

/**
 * For each line in the selection move to that line and call
 * `toggleFn` with the 1-based index of the line in the selection.
 *
 * If there is no selection we just call `toggleFn(editor)`.
 */
function modifySelection(editor, toggleFn, isList) {
  return () => {
    editor.usePrimarySelection();

    if (editor.getSelection()) {
      // there's a selection - toggle list bullet for each line
      // listNumber is 1, 2, 3... and can be used as ol bullet
      forLineIn(editor.getSelection(), (lineNumber, listNumber) => {
        // TODO move this into forLineIn
        editor.moveToLineBeginning(lineNumber);
        toggleFn(editor, listNumber);
      });
      editor.moveToLineEnd();
    } else {
      // there's no selection - just toggle line prefix
      // but if adding list, add whitespace before and after list
      if (isList && !getListNumber(editor) && !editor.lineStartsWith('- ')) {
        prepareListWhitespace(editor);
      }
      toggleFn(editor);
    }
  };
}

/**
 * Calls callback for each line number that is in the selection
 *
 * The second argument is the 1-based index of the iteration.
 *
 * @param {CodeMirror.Selection} selection
 * param {function(number)} cb
 */
function forLineIn(selection, cb) {
  // anchor/head depend on selection direction, so min & max have to be used
  const lines = [selection.anchor.line, selection.head.line];
  const lineRange = range(min(lines), max(lines) + 1);

  lineRange.forEach((lineNumber, i) => {
    cb(lineNumber, i + 1);
  });
}

function prepareListWhitespace(editor) {
  const line = editor.getCurrentLineNumber();
  const isEmpty = editor.isLineEmpty();
  const emptyLines = countEmptyLines(editor);
  const linesToInsert = (isEmpty ? 2 : 3) - emptyLines;

  editor.moveToLineEnd();
  editor.insertAtCursor(editor.getNl(linesToInsert));
  editor.restoreCursor(0, isEmpty ? line : line + 1);
  editor.restoreCursor(0, editor.getCurrentLineNumber() + 1);
}

function getListNumber(editor) {
  const result = editor.getCurrentLine().match(/^(\d+\. )/);
  return result ? result[1] : null;
}

function countEmptyLines(editor) {
  let line = editor.getCurrentLineNumber() + 1;
  let empty = 0;

  while (editor.isLineEmpty(line)) {
    empty += 1;
    line += 1;
  }

  return empty;
}

function ulToggleFn(editor) {
  if (editor.lineStartsWith('- ')) {
    editor.removeFromLineBeginning(2);
  } else {
    const listNumber = getListNumber(editor);
    if (listNumber) {
      editor.removeFromLineBeginning(listNumber.length);
    }
    editor.insertAtLineBeginning('- ');
  }
}

function olToggleFn(editor, n) {
  const listNumber = getListNumber(editor);
  if (listNumber) {
    editor.removeFromLineBeginning(listNumber.length);
  } else {
    if (editor.lineStartsWith('- ')) {
      editor.removeFromLineBeginning(2);
    }
    editor.insertAtLineBeginning((n || 1) + '. ');
  }
}

/**
 * From a table layout specification build a Markdown table template.
 *
 * Returns the lines as an array.
 * Used by the `table()` command
 *
 * @param {object} config
 * @param {number} rows
 * @param {number} cols
 * @returns {string[]}
 */
function tableTemplate(nrows, ncols) {
  const cellWidth = new Array(11);
  const cell = ' ' + cellWidth.join(' ') + ' |';
  const separatorCell = ' ' + cellWidth.join('-') + ' |';

  let baseRow = '|';
  let separatorRow = '|';

  times(ncols, () => {
    baseRow += cell;
    separatorRow += separatorCell;
  });

  const bodyRows = range(nrows).map(() => baseRow.replace(/\| {5}/g, '| Cell'));

  const headerRow = baseRow.replace(/\| {7}/g, '| Header');

  return [headerRow, separatorRow].concat(bodyRows);
}

/**
 * Toggles the header prefix for a given level on the current line.
 *
 * - Removes a header when one of the same level is
 * - Replaces the header if there is one of a different level
 * - Otherwise inserts the header
 */
function toggleHeader(editor, level) {
  return () => {
    const initialCh = editor.getCurrentCharacter();
    const currentHeader = selectHeader(editor);
    const prefix = repeat(HEADER_CHAR, level);

    // there's no header at the current line - create one
    if (!currentHeader) {
      editor.moveToLineBeginning();
      editor.insertAtCursor(prefix + ' ');
      editor.restoreCursor(initialCh + prefix.length + 1);
      return;
    }

    // there's exactly the same header - remove one
    if (editor.getSelectedText() === prefix) {
      editor.extendSelectionBy(1);
      const removedCh = editor.getSelectionLength();
      editor.removeSelectedText();
      editor.restoreCursor(initialCh - removedCh);
      return;
    }

    // there's another header at the current line - replace
    const diff = prefix.length - editor.getSelectionLength();
    editor.replaceSelectedText(prefix);
    editor.restoreCursor(initialCh + diff);
  };
}

/**
 * On the current line select a Markdown header prefix. That is the
 * string at the beginning of the line that consists of up to six `#`.
 *
 * If the selection was successful return the selected string.
 */
function selectHeader(editor) {
  // TODO use the HEADER_CHAR constant
  const result = editor.getCurrentLine().match(/^( {0,3})(#{1,6}) /);
  if (!result) {
    return null;
  }
  const indentation = result[1];
  const header = result[2];

  editor.select(getPos(0), getPos(header.length));
  return editor.getSelection();

  function getPos(modifier) {
    return {
      line: editor.getCurrentLineNumber(),
      ch: indentation.length + modifier
    };
  }
}
