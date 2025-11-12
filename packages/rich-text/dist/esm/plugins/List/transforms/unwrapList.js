import { BLOCKS } from '@contentful/rich-text-types';
import { withoutNormalizing } from '../../../internal';
import { getNodeEntries, isElement } from '../../../internal/queries';
import { unwrapNodes, liftNodes } from '../../../internal/transforms';
function hasUnliftedListItems(editor, at) {
    return getNodeEntries(editor, {
        at,
        match: (node, path)=>isElement(node) && node.type === BLOCKS.LIST_ITEM && path.length >= 2
    }).next().done;
}
export const unwrapList = (editor, { at } = {})=>{
    withoutNormalizing(editor, ()=>{
        do {
            liftNodes(editor, {
                at,
                match: (node)=>isElement(node) && node.type === BLOCKS.LIST_ITEM,
                mode: 'lowest'
            });
        }while (!hasUnliftedListItems(editor, at))
        unwrapNodes(editor, {
            at,
            match: {
                type: BLOCKS.LIST_ITEM
            },
            split: false
        });
    });
};
