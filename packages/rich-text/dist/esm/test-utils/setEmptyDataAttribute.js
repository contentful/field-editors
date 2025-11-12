import { setNodes } from '@udecode/plate-common';
import { Element } from 'slate';
export const setEmptyDataAttribute = (root)=>{
    setNodes(root, {
        data: {}
    }, {
        at: [],
        match: (node)=>Element.isElement(node) && !node.data,
        mode: 'all'
    });
};
