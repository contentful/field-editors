/** @jsx jsx */
import { PlateEditor, createEditorPlugins } from '@udecode/plate';

import { jsx } from '../../../test-utils';
import { createTablePlugin } from '../index';
import { TrackingProvider } from '../../../TrackingProvider';

describe('Table normalizer', () => {
  let tracking: TrackingProvider;

  const createTestEditor = (input: any) =>
    createEditorPlugins({
      editor: input,
      plugins: [createTablePlugin(tracking)],
    });

  // A hack to invoke normalization because calling
  // editor.normalizeNode([input, []]) doesn't work
  const forceNormalize = (editor: PlateEditor) => {
    editor.insertText(' ');
  };

  beforeEach(() => {
    tracking = {
      onViewportAction: jest.fn(),
    };
  });

  it('removes nodes not wrapped in table-row', () => {
    const input = (
      <editor>
        <table>
          <tr>
            <td>Cell 1</td>
            <td>Cell 2</td>
          </tr>
          <td>Invalid Cell</td>
          Invalid text
          <cursor />
        </table>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <table>
          <tr>
            <td>Cell 1</td>
            <td>Cell 2</td>
          </tr>
        </table>
      </editor>
    ) as any as PlateEditor;

    const editor = createTestEditor(input);

    forceNormalize(editor);

    expect(editor.children).toEqual(expected.children);
  });
});
