import { toggleMark } from 'prosemirror-commands';

import { Mark } from '../core';

const bold: Mark = {
  name: 'bold',

  toDOM: () => ['strong', 0],

  parseDOM: [
    { tag: 'strong' },
    // For Google Docs
    { tag: 'b', getAttrs: (node) => node.style.fontWeight != 'normal' && null },
    { style: 'font-weight=400', clearMark: (m) => m.type.name == 'strong' },
    {
      style: 'font-weight',
      getAttrs: (value: string) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
    },
  ],

  keymap: {
    'Mod-b': (state, dispatch) => {
      const markType = state.schema.marks['bold'];
      return toggleMark(markType)(state, dispatch);
    },
  },
};

const code: Mark = {
  name: 'code',
  schema: { code: true },
  toDOM: () => ['code', 0],
  parseDOM: [
    { tag: 'code' },
    {
      style: 'font-family',
      getAttrs: (value) => value.match(/Consolas|monospace/) && null,
    },
  ],
};

const italic: Mark = {
  name: 'italic',
  toDOM: () => ['em', 0],
  parseDOM: [{ tag: 'em' }, { tag: 'i' }],
};

const underline: Mark = {
  name: 'underline',
  toDOM: () => ['u', 0],
  parseDOM: [
    { tag: 'u' },
    { style: 'text-decoration', getAttrs: (value) => value == 'underline' && null },
  ],
};

const superscript: Mark = {
  name: 'superscript',
  schema: {
    excludes: 'subscript',
  },
  toDOM: () => ['sup', 0],
  parseDOM: [{ tag: 'sup' }],
};

const subscript: Mark = {
  name: 'subscript',
  schema: {
    excludes: 'superscript',
  },
  toDOM: () => ['sub', 0],
  parseDOM: [{ tag: 'sub' }],
};

const strikethrough: Mark = {
  name: 'strikethrough',
  toDOM: () => ['s', 0],
  parseDOM: [{ tag: 's' }],
};

export const marks: Mark[] = [bold, italic, code, underline, superscript, subscript, strikethrough];
