import type { NodeSpec } from 'prosemirror-model';

import { Node } from '../core';

export class Document extends Node {
  name = 'document';

  schema: NodeSpec = {
    content: '(paragraph | top_level_block)+',
  };
}
