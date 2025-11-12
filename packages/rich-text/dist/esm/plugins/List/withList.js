import { LIST_ITEM_BLOCKS } from '@contentful/rich-text-types';
import { normalizeList, deleteFragmentList, deleteForwardList } from '@udecode/plate-list';
import { insertListBreak } from './insertListBreak';
import { insertListFragment } from './insertListFragment';
const validLiChildrenTypes = LIST_ITEM_BLOCKS;
export const withList = (editor)=>{
    const { deleteForward, deleteFragment } = editor;
    editor.deleteForward = (unit)=>{
        if (deleteForwardList(editor, deleteForward, unit)) return;
        deleteForward(unit);
    };
    editor.deleteFragment = ()=>{
        if (deleteFragmentList(editor)) return;
        deleteFragment();
    };
    editor.insertBreak = insertListBreak(editor);
    editor.insertFragment = insertListFragment(editor);
    editor.normalizeNode = normalizeList(editor, {
        validLiChildrenTypes
    });
    return editor;
};
