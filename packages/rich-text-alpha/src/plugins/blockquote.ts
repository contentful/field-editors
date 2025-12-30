import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';
import { wrapIn, lift } from 'prosemirror-commands';
import type { NodeSpec } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';

import { Node } from '../core';

const style = css({
  margin: '0 0 1.3125rem',
  borderLeft: `6px solid ${tokens.gray200}`,
  paddingLeft: '0.875rem',
  fontStyle: 'normal',
});

export class Blockquote extends Node {
  name = 'blockquote';

  schema: NodeSpec = {
    content: 'paragraph*',
    group: 'top_level_block',
    defining: true,
    parseDOM: [{ tag: 'blockquote' }],
    toDOM: () => {
      return ['blockquote', { class: style }, 0];
    },
  };

  toggleBlockquote: Command = (state, dispatch) => {
    const type = this.type(state);

    const isActive = this.isActive(state);

    if (isActive) {
      return lift(state, dispatch);
    }

    return wrapIn(type)(state, dispatch);
  };

  shortcuts: Record<string, Command> = {
    'Mod-shift-1': this.toggleBlockquote,
  };
}
