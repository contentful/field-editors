import { FieldExtensionSDK } from '@contentful/app-sdk';
import { BLOCKS } from '@contentful/rich-text-types';
import { KeyboardHandler, setMarks, removeMark, isMarkActive, getAbove } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { Editor, Range } from 'slate';

import { RichTextEditor, RichTextPlugin } from '../../types';
import { selectEntityAndInsert } from '../EmbeddedEntityBlock/Util';
import { CommandsPalette } from './CommandsPalette';

export const COMMAND_PALETTE_INPUT = 'commands-palette';

const createOnKeyDown = (sdk: FieldExtensionSDK): KeyboardHandler<RichTextEditor> => {
  return (editor) => {
    return (event) => {
      // toggleMark(editor, { key: mark });
      if (isHotkey('/', event)) {
        setMarks(editor, { [COMMAND_PALETTE_INPUT]: true });
        // Editor.addMark(editor, COMMAND_PALETTE_INPUT, '');
        // Transforms.setNodes(editor, )
      }

      const isActive = isMarkActive(editor, COMMAND_PALETTE_INPUT);

      if (isActive) {
        if (isHotkey('enter', event)) {
          event.preventDefault();
        }

        // FIXME: worst case, just use the event.keyCode & event.shiftKey
        if (isHotkey('shift+enter', event)) {
          event.preventDefault();
        }

        if (isHotkey('up', event)) {
          event.preventDefault();
        }

        if (isHotkey('down', event)) {
          event.preventDefault();
        }

        if (isHotkey('escape', event)) {
          const [, path] = getAbove(editor)!;
          const range = Editor.range(editor, path);
          removeMark(editor, { key: COMMAND_PALETTE_INPUT, at: range });
        }
      }
    };
  };
};

export const createCommandsPalettePlugin = (sdk: FieldExtensionSDK): RichTextPlugin => {
  console.log('sdk', sdk.space.getCachedContentTypes());
  return {
    key: COMMAND_PALETTE_INPUT,
    type: COMMAND_PALETTE_INPUT,
    isLeaf: true,
    component: CommandsPalette,
    handlers: {
      onKeyDown: createOnKeyDown(sdk),
    },
  };
};
