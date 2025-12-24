import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';
import type { NodeSpec } from 'prosemirror-model';

import { Node } from '../core';

const styles = {
  p: css`
    line-height: ${tokens.lineHeightDefault};
    margin-bottom: 1.5em;
    direction: inherit;
  `,
};

export class Paragraph extends Node {
  name = 'paragraph';

  schema: NodeSpec = {
    content: 'inline*',
    group: 'block',
    parseDOM: [{ tag: 'p' }],
    toDOM() {
      return ['p', { class: styles.p }, 0];
    },
  };
}
