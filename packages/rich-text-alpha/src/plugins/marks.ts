import type { FieldAppSDK } from '@contentful/app-sdk';
import type { MarkSpec } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';

import { Mark } from '../core';

class Bold extends Mark {
  name = 'bold';

  schema: MarkSpec = {
    toDOM: () => ['strong', 0],
    parseDOM: [
      { tag: 'strong' },
      {
        tag: 'b',
        getAttrs: (node) => node.style.fontWeight != 'normal' && null,
      },
      {
        style: 'font-weight=400',
        clearMark: (m) => m.type.name == 'strong',
      },
      {
        style: 'font-weight',
        getAttrs: (value) => /^(bold(er)?|600|700)$/.test(value) && null,
      },
    ],
  };

  shortcuts: Record<string, Command> = {
    'Mod-b': this.toggleMark,
  };
}

class Code extends Mark {
  name = 'code';

  schema: MarkSpec = {
    code: true,
    toDOM: () => ['code', 0],
    parseDOM: [
      { tag: 'code' },
      {
        style: 'font-family',
        getAttrs: (value) => value.match(/monospace/) && null,
      },
    ],
  };

  shortcuts: Record<string, Command> = {
    'Mod-/': this.toggleMark,
  };
}

class Italic extends Mark {
  name = 'italic';

  schema: MarkSpec = {
    toDOM: () => ['em', 0],
    parseDOM: [{ tag: 'em' }, { tag: 'i' }],
  };

  shortcuts: Record<string, Command> = {
    'Mod-i': this.toggleMark,
  };
}

class Underline extends Mark {
  name = 'underline';

  schema: MarkSpec = {
    toDOM: () => ['u', 0],
    parseDOM: [
      { tag: 'u' },
      {
        style: 'text-decoration',
        getAttrs: (value) => value == 'underline' && null,
      },
    ],
  };

  shortcuts: Record<string, Command> = {
    'Mod-u': this.toggleMark,
  };
}

class Superscript extends Mark {
  name = 'superscript';

  schema: MarkSpec = {
    excludes: 'subscript',
    toDOM: () => ['sup', 0],
    parseDOM: [{ tag: 'sup' }],
  };
}

class Subscript extends Mark {
  name = 'subscript';

  schema: MarkSpec = {
    excludes: 'superscript',
    toDOM: () => ['sub', 0],
    parseDOM: [{ tag: 'sub' }],
  };
}

class Strikethrough extends Mark {
  name = 'strikethrough';

  schema: MarkSpec = {
    toDOM: () => ['s', 0],
    parseDOM: [{ tag: 's' }],
  };
}

export const marks = (sdk: FieldAppSDK) => [
  new Bold(sdk),
  new Code(sdk),
  new Italic(sdk),
  new Underline(sdk),
  new Superscript(sdk),
  new Subscript(sdk),
  new Strikethrough(sdk),
];
