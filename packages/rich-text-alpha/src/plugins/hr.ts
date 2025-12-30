import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';
import type { NodeSpec } from 'prosemirror-model';
import type { EditorState } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

import { Node } from '../core';

const styles = {
  hr: css`
    margin: 0 0 ${tokens.spacingL};
    height: ${tokens.spacingM};
    position: relative;
    border: 0;
    cursor: pointer;
    outline: none !important;

    &::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 1px;
      background: ${tokens.gray300};
      top: 50%;
      outline: none;
    }
  `,
  selected: css`
    &::after {
      background: ${tokens.colorPrimary};
      box-shadow: 0px 0px 5px ${tokens.colorPrimary};
    }
  `,
};

export class HorizontalRule extends Node {
  name = 'hr';

  schema: NodeSpec = {
    group: 'top_level_block',
    draggable: true,
    parseDOM: [{ tag: 'hr' }],
    toDOM: () => ['hr', { class: styles.hr }],
  };

  decorations = (state: EditorState) => {
    const { from, to } = state.selection;
    const decorations: Decoration[] = [];

    state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.type.name === this.name) {
        decorations.push(
          Decoration.node(pos, pos + node.nodeSize, {
            class: styles.selected,
          }),
        );
      }
    });

    return DecorationSet.create(state.doc, decorations);
  };
}
