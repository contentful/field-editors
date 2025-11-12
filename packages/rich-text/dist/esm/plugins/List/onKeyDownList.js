import isHotkey from 'is-hotkey';
import { getAboveNode } from '../../internal/queries';
import { moveListItems } from './transforms/moveListItems';
import { toggleList } from './transforms/toggleList';
export const onKeyDownList = (editor, { type, options: { hotkey } })=>(e)=>{
        if (e.key === 'Tab' && editor.selection) {
            const listSelected = getAboveNode(editor, {
                at: editor.selection,
                match: {
                    type
                }
            });
            if (listSelected) {
                e.preventDefault();
                moveListItems(editor, {
                    increase: !e.shiftKey
                });
                return;
            }
        }
        if (!hotkey) return;
        const hotkeys = Array.isArray(hotkey) ? hotkey : [
            hotkey
        ];
        for (const _hotkey of hotkeys){
            if (isHotkey(_hotkey)(e)) {
                toggleList(editor, {
                    type
                });
            }
        }
    };
