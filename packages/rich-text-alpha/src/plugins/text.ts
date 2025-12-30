import type { NodeSpec } from 'prosemirror-model';

import { Node } from '../core';

export class Text extends Node {
  name = 'text';

  schema: NodeSpec = {
    group: 'inline',
    inline: true,
  };
}
