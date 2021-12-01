/** @jsx jsx */
import { createEditorPlugins } from '@udecode/plate';

import { jsx } from '../../../test-utils';
import { createTablePlugin } from '../index';
import { TrackingProvider } from '../../../TrackingProvider';
import { Editor } from 'slate';

describe('Table normalizers', () => {
  let tracking: TrackingProvider;

  const createTestEditor = (input: any) =>
    createEditorPlugins({
      editor: input,
      plugins: [createTablePlugin(tracking)],
    });

  const assertOutput = (input: any, expected: any) => {
    const editor = createTestEditor(input);

    // A hack to force normalization since calling
    // editor.normalizeNode([input, []]) doesn't work
    Editor.withoutNormalizing(editor, () => {
      editor.insertText('X');
      editor.deleteBackward('character');
    });

    expect(editor.children).toEqual(expected.children);
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
            <td>
              <p>Cell 1</p>
            </td>
            <td>
              <p>Cell 2</p>
            </td>
          </tr>
          <td>
            invalid cell <cursor />
          </td>
          invalid text
        </table>
      </editor>
    );
    const expected = (
      <editor>
        <table>
          <tr>
            <td>
              <p>Cell 1</p>
            </td>
            <td>
              <p>Cell 2</p>
            </td>
          </tr>
        </table>
      </editor>
    );

    assertOutput(input, expected);
  });

  it('converts invalid table-cell children to paragraphs', () => {
    const input = (
      <editor>
        <table>
          <tr>
            <td>
              <p>Cell 1</p>
            </td>
            <td>
              <p>Cell 2</p>
              <blockquote>
                <p>quote</p>
                <cursor />
              </blockquote>
            </td>
          </tr>
        </table>
      </editor>
    );

    const expected = (
      <editor>
        <table>
          <tr>
            <td>
              <p>Cell 1</p>
            </td>
            <td>
              <p>Cell 2</p>
              <p>quote</p>
            </td>
          </tr>
        </table>
      </editor>
    );

    assertOutput(input, expected);
  });
});
