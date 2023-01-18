import { BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';

import { getNodeEntries } from '../internal/queries';
import { PlateEditor, Node, Path, NodeMatch } from '../internal/types';

function extractNodes(editor: PlateEditor, path: Path, match: NodeMatch) {
  return Array.from(
    getNodeEntries(editor, {
      match,
      at: path,
      mode: 'lowest',
    })
  ).map(([node]) => node);
}

/**
 * It filters out all paragraphs and headings from a path and convert them into paragraphs.
 */
export function extractParagraphs(editor: PlateEditor, path: Path): Node[] {
  return extractNodes(editor, path, {
    type: TEXT_CONTAINERS,
  }).map((node) => ({
    ...node,
    type: BLOCKS.PARAGRAPH,
  }));
}
