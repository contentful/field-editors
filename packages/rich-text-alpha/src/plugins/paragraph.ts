import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';
import type { NodeSpec } from 'prosemirror-model';

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
    group: 'block top_level_block',
    parseDOM: [{ tag: 'p' }],
    toDOM() {
      return ['p', { class: style }, 0];
    },
  };
}
