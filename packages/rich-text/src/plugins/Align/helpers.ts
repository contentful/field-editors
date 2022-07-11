import { ALIGNMENT, CustomElement } from './types';
import { HotkeyPlugin, isMarkActive, KeyboardHandler, toggleMark } from '@udecode/plate-core';
import { Node, Range } from 'slate';
import isHotkey from 'is-hotkey';

import { RichTextEditor } from '../../types';
import { Alignment } from '@udecode/plate-alignment';

  export const isAlignActive = (editor: RichTextEditor, type: Alignment): boolean => {
    const { selection } = editor;
  
    if (!selection) {
      return false;
    }

    // TODO: use Range to figure out if items use custom alignment
    if (Range.isExpanded(selection)) {
      const [start, end] = Range.edges(selection);
      const node = Node.common(editor, start.path, end.path);
      if ((node[0] as CustomElement).type === type) {
        return true
      }
    }

    return false



    // if (Range.isExpanded(selection)) {
    //   const [start, end] = Range.edges(selection);
    //   const node = Node.common(editor, start.path, end.path);
    //   console.log((node[0] as CustomElement))
    //   console.log('got to true')
  
    //   if ((node[0] as CustomElement).type === type) {
    //     return true;
    //   }
  };