import { PlateEditor } from '@udecode/plate-core';

import { createTestEditor, normalize } from './createEditor';
import { setEmptyDataAttribute } from './setEmptyDataAttribute';

export const assertOutput = (options: {
  input?: any;
  expected: any;
  editor?: PlateEditor;
  log?: boolean;
}) => {
  const editor =
    options.editor ??
    createTestEditor({
      input: options.input,
    }).editor;

  normalize(editor);

  setEmptyDataAttribute(editor);

  if (options.log) {
    console.log(
      JSON.stringify(
        {
          expected: options.expected,
          actual: editor.children,
          actualSelection: editor.selection,
        },
        null,
        2
      )
    );
  }

  expect(editor.children).toEqual(options.expected.children);

  // Assert cursor position
  expect(editor.selection).toEqual(options.expected.selection);
};
