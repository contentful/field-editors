import { BLOCKS } from '@contentful/rich-text-types';
/**
 * Checks if the first block in the document is void and is focused.
 *
 * @param {Slate.Editor} editor
 * @returns {Boolean}
 */
export function isVoidBlockFirstAndFocused(editor) {
  return (
    editor.value.document.getBlocks().first() === editor.value.focusBlock &&
    editor.isVoid(editor.value.focusBlock)
  );
}

/**
 * Inserts and focuses an empty paragraph as a first child to the document.
 *
 * @param {Slate.Editor} editor
 * @returns {void}
 */

export function insertParagraphAndFocusToStartOfDocument(editor) {
  editor
    .splitBlock()
    .moveToStartOfDocument()
    .setBlocks(BLOCKS.PARAGRAPH)
    .focus();
}
