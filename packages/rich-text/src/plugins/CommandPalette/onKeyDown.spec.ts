import * as internal from '../../internal/transforms';
import { createTestEditor } from '../../test-utils';
import { COMMAND_PROMPT } from './constants';
import { createOnKeyDown } from './onKeyDown';

vi.mock('../../internal/transforms', async (importOriginal) => {
  const module = (await importOriginal()) as any;

  return {
    __esModule: true,
    ...module,
  };
});

describe('onKeyDown', () => {
  const { editor } = createTestEditor({});

  const addMark = vi.spyOn(internal, 'addMark');
  const onCommandPaletteAction = vi.spyOn(editor.tracking, 'onCommandPaletteAction');

  afterEach(() => {
    vi.resetAllMocks();
  });

  test.each`
    layout      | key
    ${'QUERTY'} | ${{ key: '/', which: 191, shiftKey: false }}
    ${'QWERTZ'} | ${{ key: '/', which: 55, shiftKey: true }}
  `('supports hotKeys for every keyboard layout #{layout}', ({ key }) => {
    createOnKeyDown()(editor, {} as any)({
      type: 'keydown',
      ...key,
    });

    expect(addMark).toHaveBeenCalledTimes(1);
    expect(addMark).toHaveBeenCalledWith(editor, COMMAND_PROMPT);

    expect(onCommandPaletteAction).toHaveBeenCalledTimes(1);
    expect(onCommandPaletteAction).toHaveBeenCalledWith('openRichTextCommandPalette');
  });
});
