import { getListTypes } from '@udecode/plate-list';
import { withoutNormalizing } from '../../../internal';
import { getNodeEntry, getNodeChildren, getNextPath, getPreviousPath, getLastChildPath, match } from '../../../internal/queries';
import { wrapNodes, moveNodes } from '../../../internal/transforms';
export const moveListItemDown = (editor, { list, listItem })=>{
    const [listNode] = list;
    const [, listItemPath] = listItem;
    let previousListItemPath;
    try {
        previousListItemPath = getPreviousPath(listItemPath);
    } catch (e) {
        return;
    }
    const previousSiblingItem = getNodeEntry(editor, previousListItemPath);
    if (previousSiblingItem) {
        const [, previousPath] = previousSiblingItem;
        const subList = Array.from(getNodeChildren(editor, previousPath)).find(([n, path])=>match(n, path, {
                type: getListTypes(editor)
            }));
        const newPath = getNextPath(getLastChildPath(subList ?? previousSiblingItem));
        withoutNormalizing(editor, ()=>{
            if (!subList) {
                wrapNodes(editor, {
                    type: listNode.type,
                    children: [],
                    data: {}
                }, {
                    at: listItemPath
                });
            }
            moveNodes(editor, {
                at: listItemPath,
                to: newPath
            });
        });
    }
};
