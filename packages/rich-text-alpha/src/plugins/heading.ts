import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';
import { setBlockType } from 'prosemirror-commands';
import type { NodeSpec } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';

import { Node } from '../core';
import { invariant } from '../core/utils';


const style = css({
  lineHeight: tokens.lineHeightDefault,
  fontWeight: tokens.fontWeightMedium,
  margin: `0 0 ${tokens.spacingS}`,
  direction: 'inherit',

  'h1&': css`
    font-size: 1.875rem;
  `,
  'h2&': css`
    font-size: 1.5625rem;
  `,
  'h3&': css`
    font-size: 1.375rem;
  `,
  'h4&': css`
    font-size: 1.25rem;
  `,
  'h5&': css`
    font-size: 1.125rem;
  `,
  'h6&': css`
    font-size: 1rem;
  `,
});

export class Heading extends Node {
  name = 'heading';

  schema: NodeSpec = {
    attrs: {
      level: {
        default: 1,
        validate: (value: number) => {
          invariant(
            typeof value === 'number' && value >= 1 && value <= 6,
            'Heading level must be between 1 and 6',
          );
        },
      },
    },
    content: 'inline*',
    group: 'top_level_block',
    defining: true,
    parseDOM: [
      { tag: 'h1', attrs: { level: 1 } },
      { tag: 'h2', attrs: { level: 2 } },
      { tag: 'h3', attrs: { level: 3 } },
      { tag: 'h4', attrs: { level: 4 } },
      { tag: 'h5', attrs: { level: 5 } },
      { tag: 'h6', attrs: { level: 6 } },
    ],
    toDOM(node) {
      return ['h' + node.attrs.level, { class: style }, 0];
    },
  };

  setHeading =
    (level: number): Command =>
    (state, dispatch) => {
      const type = this.nodeType(state);
      return setBlockType(type, { level })(state, dispatch);
    };

  shortcuts: Record<string, Command> = {
    'mod-alt-1': this.setHeading(1),
    'mod-alt-2': this.setHeading(2),
    'mod-alt-3': this.setHeading(3),
    'mod-alt-4': this.setHeading(4),
    'mod-alt-5': this.setHeading(5),
    'mod-alt-6': this.setHeading(6),
  };
}
