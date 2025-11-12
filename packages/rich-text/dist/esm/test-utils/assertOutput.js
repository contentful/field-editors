import { normalize } from '../internal';
import { createTestEditor } from './createTestEditor';
import { setEmptyDataAttribute } from './setEmptyDataAttribute';
export const assertOutput = (options)=>{
    const editor = options.editor ?? createTestEditor({
        input: options.input
    }).editor;
    normalize(editor);
    setEmptyDataAttribute(editor);
    if (options.log) {
        console.log(JSON.stringify({
            expected: options.expected,
            actual: editor.children,
            actualSelection: editor.selection
        }, null, 2));
    }
    expect(editor.children).toEqual(options.expected.children);
    if (options.expected.selection !== null) {
        expect(editor.selection).toEqual(options.expected.selection);
    }
};
