/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';
import { PlateEditor, createEditorPlugins } from '@udecode/plate';

import { createTablePlugin } from '../index';
import { TrackingProvider } from '../../../TrackingProvider';

jsx;

describe('Table normalizer', () => {
  let tracking: TrackingProvider;

  const createTestEditor = (input: any) =>
    createEditorPlugins({
      editor: input,
      plugins: [createTablePlugin(tracking)],
    });

  beforeEach(() => {
    tracking = {
      onViewportAction: jest.fn(),
    };
  });

  it('removes nodes not wrapped in table-row', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>Cell 1</htd>
            <htd>
              Cell 22
              <cursor />
            </htd>
          </htr>
          <htd>Invalid Cell</htd>
          Invalid text
        </htable>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <htable>
          <htr>
            <htd>Cell 1</htd>
            <htd>Cell 2</htd>
          </htr>
        </htable>
      </editor>
    ) as any as PlateEditor;

    const editor = createTestEditor(input);

    // Calling normalizeNode directly doesn't work. Instead,
    // we are implicitly doing so here
    editor.deleteBackward('character');

    expect(editor.children).toEqual(expected.children);
  });
});
