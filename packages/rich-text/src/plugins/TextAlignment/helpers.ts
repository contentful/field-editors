import { ALIGNMENT, CustomElement } from './types';
import { HotkeyPlugin, isMarkActive, KeyboardHandler, toggleMark } from '@udecode/plate-core';
import { getBlockAbove } from '@udecode/plate-core';
import { Node, Range } from 'slate';
import isHotkey from 'is-hotkey';

import { RichTextEditor } from '../../types';
import { Alignment } from '@udecode/plate-alignment';

  export const isTextAlignmentTypeActive = (editor: RichTextEditor, type: Alignment): boolean => {
    const { selection } = editor;
    // console.log({selection})
  
    if (!selection) {
      return false;
    }

    if (Range.isExpanded(selection)) {
      const [start, end] = Range.edges(selection);
      const node = Node.common(editor, start.path, end.path);
      console.log({node})
  
      if ((node[0] as CustomElement).type === type) {
        return true;
      }
    }
    return false
  };