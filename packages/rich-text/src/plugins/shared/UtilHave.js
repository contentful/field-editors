export const haveMarks = ({ value }, type) => {
  return value.activeMarks.some(mark => mark.type === type);
};

export const haveBlocks = ({ value }, type) => {
  return value.blocks.some(node => node.type === type);
};

export const haveInlines = ({ value }, type) => {
  return value.inlines.some(inline => inline.type === type);
};

export function haveAnyInlines({ value }) {
  return value.inlines.size > 0;
}

/**
 * Checks if all inline nodes in the selectin have a certain type.
 * Returns false if there are no inline nodes in the selection.
 *
 * @param {slate.Editor} editor
 * @param {string} type
 * @returns {boolean}
 */
export function haveEveryInlineOfType({ value }, type) {
  if (value.inlines.size > 0) {
    return value.inlines.every(inline => inline.type === type);
  }

  return false;
}

export const haveTextInSomeBlocks = ({ value }) => {
  if (value.blocks.size > 0) {
    return value.blocks.some(block => block.text);
  }
};
