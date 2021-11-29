/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';
import { PlateEditor, createEditorPlugins } from '@udecode/plate';
import { createTablePlugin } from '../index';

jsx;

// Copied from plate source code. Remove later
describe('li > lic * 2 with selection at second child start', () => {
  it('should merge the children', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>one</hlic>
            <hlic>
              <cursor />
              two
            </hlic>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <hul>
          <hli>
            <hlic>onetwo</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const editor = createEditorPlugins({
      editor: input,
      plugins: [createTablePlugin()],
    });

    editor.deleteBackward('character');

    expect(editor.children).toEqual(expected.children);
  });
});
