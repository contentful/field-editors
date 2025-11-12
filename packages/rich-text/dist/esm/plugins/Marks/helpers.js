import { MARKS } from '@contentful/rich-text-types';
import isHotkey from 'is-hotkey';
import { isMarkActive } from '../../internal/queries';
import { toggleMark } from '../../internal/transforms';
export const toggleMarkAndDeactivateConflictingMarks = (editor, mark)=>{
    const subs = [
        MARKS.SUPERSCRIPT,
        MARKS.SUBSCRIPT
    ];
    const clear = subs.includes(mark) ? subs : [];
    toggleMark(editor, {
        key: mark,
        clear
    });
};
export const buildMarkEventHandler = (type)=>(editor, { options: { hotkey } })=>(event)=>{
            if (editor.selection && hotkey && isHotkey(hotkey, event)) {
                event.preventDefault();
                const isActive = isMarkActive(editor, type);
                editor.tracking.onShortcutAction(isActive ? 'unmark' : 'mark', {
                    markType: type
                });
                toggleMarkAndDeactivateConflictingMarks(editor, type);
            }
        };
