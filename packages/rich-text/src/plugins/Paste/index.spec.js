import { PastePlugin } from '.';
import * as pasteUtils from './Paste';

describe('Paste Plugin', () => {
  let editor;

  beforeEach(() => {
    jest.spyOn(pasteUtils, 'getCharacterCount');
    jest.useFakeTimers();

    editor = jest.fn();
  });

  afterEach(() => {
    jest.clearAllTimers();
    pasteUtils.getCharacterCount.mockClear();
    delete global.getSelection;
  });

  function testPasteTrackingForValues(
    type,
    { characterCountAfter, characterCountBefore, characterCountSelection }
  ) {
    describe(`handling ${type}`, () => {
      beforeEach(() => {
        pasteUtils.getCharacterCount
          .mockImplementationOnce(arg => {
            if (arg === editor) {
              return characterCountBefore;
            }
          })
          .mockImplementationOnce(arg => {
            if (arg === editor) {
              return characterCountAfter;
            }
          });

        // We can't mock getSelection with document.createRange() and friends
        // because Jest runs the tests with jsdom, which lacks a window object
        // and its associated BOM methods.
        global.getSelection = () => ({
          toString: () => 'x'.repeat(characterCountSelection)
        });
      });

      it('tracks pasted text', () => {
        const logShortcutAction = jest.fn();
        const next = jest.fn();
        const plugin = PastePlugin({ richTextAPI: { logShortcutAction } });
        const result = plugin.onPaste({}, editor, next);

        expect(result).toBeUndefined();
        expect(next).toHaveBeenCalled();
        expect(pasteUtils.getCharacterCount).toHaveBeenCalledTimes(1);
        expect(pasteUtils.getCharacterCount).lastCalledWith(editor);
        expect(logShortcutAction).toHaveBeenCalledTimes(0);

        jest.runOnlyPendingTimers();

        expect(pasteUtils.getCharacterCount).toHaveBeenCalledTimes(2);
        expect(pasteUtils.getCharacterCount).lastCalledWith(editor);
        expect(logShortcutAction).toHaveBeenCalledWith('paste', {
          characterCountAfter,
          characterCountBefore,
          characterCountSelection
        });
      });
    });
  }

  testPasteTrackingForValues('values > 0', {
    characterCountAfter: 49,
    characterCountBefore: 42,
    characterCountSelection: 15
  });

  // This test is necessary to ensure 0 values are correctly reported as 0
  // and not null, as would be the default.
  testPasteTrackingForValues('zero values', {
    characterCountAfter: 0,
    characterCountBefore: 0,
    characterCountSelection: 0
  });
});
