import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';
import { setBlockType } from 'prosemirror-commands';
import type { NodeSpec } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';

import { Node } from '../core';

const style = css({
  lineHeight: tokens.lineHeightDefault,
  marginBottom: '1.5em',
  direction: 'inherit',
});

export class Paragraph extends Node {
  name = 'paragraph';

  schema: NodeSpec = {
    content: 'inline*',
    group: 'top_level_block',
    parseDOM: [{ tag: 'p' }],
    toDOM: () => {
      return ['p', { class: style }, 0];
    },
  };

  setParagraph: Command = (state, dispatch) => {
    const type = this.nodeType(state);
    return setBlockType(type)(state, dispatch);
  };

  shortcuts: Record<string, Command> = {
    'mod-alt-0': this.setParagraph,
  };
}
