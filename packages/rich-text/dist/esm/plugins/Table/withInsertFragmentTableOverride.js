import { ELEMENT_DEFAULT, getPluginType, getTEditor } from '@udecode/plate-common';
import { ELEMENT_TABLE } from '@udecode/plate-table';
import { insertNodes } from '../../internal';
export const withInsertFragmentTableOverride = (editor)=>{
    const myEditor = getTEditor(editor);
    const upstreamInsertFragment = myEditor.insertFragment;
    myEditor.insertFragment = (fragment)=>{
        const insertedTable = fragment.find((n)=>n.type === getPluginType(editor, ELEMENT_TABLE));
        if (insertedTable && fragment.length === 1 && fragment[0].type === ELEMENT_TABLE) {
            insertNodes(editor, fragment, {
                removeEmpty: {
                    exclude: [
                        ELEMENT_DEFAULT
                    ]
                }
            });
            return;
        } else {
            upstreamInsertFragment(fragment);
        }
    };
    return editor;
};
