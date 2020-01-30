import { BLOCKS } from '@contentful/rich-text-types';

const getParent = editor => {
  const range = editor.value.selection;

  if (!range.start.key) {
    return null;
  }

  const startBlock = editor.value.document.getClosestBlock(range.start.key);

  return editor.value.document.getParent(startBlock.key);
};

export const isSelectionInQuote = editor => {
  const ancestor = getParent(editor);

  if (!ancestor) {
    return false;
  }

  return ancestor.type === BLOCKS.QUOTE;
};

/**
 * Toggles formatting between block quote and a plain paragraph.
 *
 * @param {slate.Editor} editor
 * @returns {boolean} New toggle state after the change.
 */
export const applyChange = editor => {
  const isActive = isSelectionInQuote(editor);
  if (isActive) {
    editor.unwrapBlock(BLOCKS.QUOTE);
  } else {
    editor.setBlocks(BLOCKS.PARAGRAPH).wrapBlock(BLOCKS.QUOTE);
  }
  return !isActive;
};
