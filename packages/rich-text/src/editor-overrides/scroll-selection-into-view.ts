/**
 * TODO: This is an override from a later version of slate-react
 * ultimately instead of overriding we want to upgrade the version
 *
 * https://github.com/ianstormtaylor/slate/pull/5902/files
 */
import scrollIntoView from 'scroll-into-view-if-needed';

import { DOMRange, ReactEditor, Range } from '../internal';

export const defaultScrollSelectionIntoView = (editor: ReactEditor, domRange: DOMRange) => {
  // This was affecting the selection of multiple blocks and dragging behavior,
  // so enabled only if the selection has been collapsed.
  if (
    domRange.getBoundingClientRect &&
    (!editor.selection || (editor.selection && Range.isCollapsed(editor.selection)))
  ) {
    const leafEl = domRange.startContainer.parentElement!;

    // COMPAT: In Chrome, domRange.getBoundingClientRect() can return zero dimensions for valid ranges (e.g. line breaks).
    // When this happens, do not scroll like most editors do.
    const domRect = domRange.getBoundingClientRect();
    const isZeroDimensionRect =
      domRect.width === 0 && domRect.height === 0 && domRect.x === 0 && domRect.y === 0;

    if (isZeroDimensionRect) {
      const leafRect = leafEl.getBoundingClientRect();
      const leafHasDimensions = leafRect.width > 0 || leafRect.height > 0;

      if (leafHasDimensions) {
        return;
      }
    }

    // Default behavior: use domRange's getBoundingClientRect
    leafEl.getBoundingClientRect = domRange.getBoundingClientRect.bind(domRange);
    scrollIntoView(leafEl, {
      scrollMode: 'if-needed',
    });
    // @ts-expect-error an unorthodox delete D:
    delete leafEl.getBoundingClientRect;
  }
};
