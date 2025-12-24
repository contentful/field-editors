import { baseKeymap } from 'prosemirror-commands';
import { keydownHandler } from 'prosemirror-keymap';
import type { NodeSpec } from 'prosemirror-model';
import type { Plugin } from 'prosemirror-state';

import { Node } from '../core';

export class Document extends Node {
  name = 'document';

  schema: NodeSpec = {
    content: '(paragraph | top_level_block)+',
  };

  props: Plugin['props'] = {
    handleKeyDown: keydownHandler(baseKeymap),
  };
}
