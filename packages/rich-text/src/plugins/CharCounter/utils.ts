import type { Node, PlateEditor } from '../../internal/types';
import { isText } from '../../internal';
import { BLOCKS } from '@contentful/rich-text-types';

const blocks = new Set(Object.values(BLOCKS) as string[]);

export function getTextContent(root: PlateEditor | Node): string {
  if (isText(root)) {
    return root.text;
  }

  const nodes = root.children as Node[];

  return nodes.reduce((acc, node, index) => {
    const text = getTextContent(node);

    if (!text) {
      return acc;
    }

    const nextNode = nodes[index + 1];

    if (nextNode && blocks.has(nextNode.type as string)) {
      return acc + text + ' ';
    }

    return acc + text;
  }, '');
}
