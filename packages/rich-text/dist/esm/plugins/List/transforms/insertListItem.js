import { BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';
import { withoutNormalizing } from '../../../internal';
import { getAboveNode, getParentNode, isFirstChildPath, isSelectionAtBlockEnd, isSelectionAtBlockStart, getMarks, getNextPath } from '../../../internal/queries';
import { select, insertNodes, moveChildren, splitNodes, collapseSelection } from '../../../internal/transforms';
const emptyListItemNode = (editor, withChildren = false)=>{
    let children = [];
    if (withChildren) {
        const marks = getMarks(editor) || {};
        children = [
            {
                type: BLOCKS.PARAGRAPH,
                data: {},
                children: [
                    {
                        text: '',
                        ...marks
                    }
                ]
            }
        ];
    }
    return {
        type: BLOCKS.LIST_ITEM,
        data: {},
        children
    };
};
export const insertListItem = (editor)=>{
    if (!editor.selection) {
        return false;
    }
    const paragraph = getAboveNode(editor, {
        match: {
            type: TEXT_CONTAINERS
        }
    });
    if (!paragraph) {
        return false;
    }
    const [, paragraphPath] = paragraph;
    const listItem = getParentNode(editor, paragraphPath);
    if (!listItem) {
        return false;
    }
    const [listItemNode, listItemPath] = listItem;
    if (listItemNode.type !== BLOCKS.LIST_ITEM) {
        return false;
    }
    withoutNormalizing(editor, ()=>{
        if (!editor.selection) {
            return;
        }
        const isAtStart = isSelectionAtBlockStart(editor);
        const isAtEnd = isSelectionAtBlockEnd(editor);
        const isAtStartOfListItem = isAtStart && isFirstChildPath(paragraphPath);
        const shouldSplit = !isAtStart && !isAtEnd;
        if (shouldSplit) {
            splitNodes(editor);
        }
        const newListItemPath = isAtStartOfListItem ? listItemPath : getNextPath(listItemPath);
        insertNodes(editor, emptyListItemNode(editor, !shouldSplit), {
            at: newListItemPath
        });
        const fromPath = isAtStart ? paragraphPath : getNextPath(paragraphPath);
        const fromStartIndex = fromPath[fromPath.length - 1] || 0;
        const toPath = newListItemPath.concat([
            shouldSplit ? 0 : 1
        ]);
        if (!isAtStartOfListItem) {
            moveChildren(editor, {
                at: listItemPath,
                to: toPath,
                fromStartIndex
            });
        }
        select(editor, newListItemPath);
        collapseSelection(editor, {
            edge: 'start'
        });
    });
    return true;
};
