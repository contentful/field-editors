import * as p from '@udecode/plate-common';
import { normalize } from './transforms';
export const createPlateEditor = (options = {})=>{
    return p.createPlateEditor(options);
};
export const normalizeInitialValue = (options, initialValue)=>{
    const editor = createPlateEditor(options);
    if (initialValue) {
        editor.children = initialValue;
    }
    normalize(editor, {
        force: true
    });
    return editor.children;
};
export const focusEditor = (editor, target)=>{
    p.focusEditor(editor, target);
};
export const blurEditor = (editor)=>{
    p.blurEditor(editor);
};
export const selectEditor = (editor, opts)=>{
    p.selectEditor(editor, opts);
};
export const fromDOMPoint = (editor, domPoint, opts = {
    exactMatch: false,
    suppressThrow: false
})=>{
    return p.toSlatePoint(editor, domPoint, opts);
};
export const mockPlugin = (plugin)=>{
    return p.mockPlugin(plugin);
};
