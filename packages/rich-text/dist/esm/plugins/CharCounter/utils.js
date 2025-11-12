import { isText } from '../../internal';
import { BLOCKS } from '@contentful/rich-text-types';
const blocks = new Set(Object.values(BLOCKS));
export function getTextContent(root) {
    if (isText(root)) {
        return root.text;
    }
    const nodes = root.children;
    return nodes.reduce((acc, node, index)=>{
        const text = getTextContent(node);
        if (!text) {
            return acc;
        }
        const nextNode = nodes[index + 1];
        if (nextNode && blocks.has(nextNode.type)) {
            return acc + text + ' ';
        }
        return acc + text;
    }, '');
}
