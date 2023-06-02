import * as internal from '../../internal/transforms';
import { createTestEditor } from '../../test-utils';
import { COMMAND_PROMPT } from './constants';
import { createOnKeyDown } from './onKeyDown';

jest.mock('../../internal/transforms', () => {
  return {
    __esModule: true,
    ...jest.requireActual('../../internal/transforms'),
  };
});

describe('onKeyDown', () => {
  const { editor } = createTestEditor({});

  const addMark = jest.spyOn(internal, 'addMark');
  const onCommandPaletteAction = jest.spyOn(editor.tracking, 'onCommandPaletteAction');

  afterEach(() => {
    jest.resetAllMocks();
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
