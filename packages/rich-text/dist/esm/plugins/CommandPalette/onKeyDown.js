import isHotkey from 'is-hotkey';
import { getRange, getAboveNode, isMarkActive, addMark, removeMark } from '../../internal';
import { focusEditor } from '../../internal/misc';
import { COMMAND_PROMPT } from './constants';
export const createOnKeyDown = ()=>{
    return (editor)=>{
        return (event)=>{
            if (isHotkey('shift?+/', {
                byKey: true
            }, event)) {
                addMark(editor, COMMAND_PROMPT);
                editor.tracking.onCommandPaletteAction('openRichTextCommandPalette');
            }
            const isActive = isMarkActive(editor, COMMAND_PROMPT);
            if (!isActive) {
                return;
            }
            if (isHotkey('enter', event)) {
                return event.preventDefault();
            }
            const [, path] = getAboveNode(editor);
            const range = getRange(editor, path);
            if (isHotkey('backspace', event)) {
                if (range.focus.offset - range.anchor.offset === 1) {
                    removeMark(editor, COMMAND_PROMPT, range);
                }
            }
            if (isHotkey('escape', event)) {
                event.stopPropagation();
                removeMark(editor, COMMAND_PROMPT, range);
                editor.tracking.onCommandPaletteAction('cancelRichTextCommandPalette');
                focusEditor(editor);
            }
        };
    };
};
