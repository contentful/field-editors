import debounce from 'p-debounce';
import { getTextContent } from './utils';
const CHARACTER_COUNT_DEBOUNCE_TIME = 300;
export const withCharCounter = (editor)=>{
    const { apply } = editor;
    let count;
    editor.getCharacterCount = ()=>{
        if (count === undefined) {
            count = getTextContent(editor).length;
        }
        return count;
    };
    const recount = debounce(async ()=>{
        count = getTextContent(editor).length;
    }, CHARACTER_COUNT_DEBOUNCE_TIME);
    editor.apply = (op)=>{
        apply(op);
        recount();
    };
    return editor;
};
