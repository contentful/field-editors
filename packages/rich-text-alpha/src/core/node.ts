import type { NodeSpec } from 'prosemirror-model';
import type { LiteralUnion } from 'type-fest';

export interface Node {
  /**
   * The alphanumeric, unique name of the node. e.g. paragraph, heading_1,
   * ..etc.
   */
  name: string;

  /**
   * The group or groups to which this node belongs, which can be referred
   * to in the content expressions for the schema. e.g. top_level_block,
   * block ..etc
   */
  groups?: LiteralUnion<
    'top_level_block' | 'table_cell_content' | 'list_content' | 'block' | 'inline',
    string
  >[];

  schema: Pick<
    NodeSpec,
    | 'content'
    | 'marks'
    | 'inline'
    | 'atom'
    | 'attrs'
    | 'selectable'
    | 'draggable'
    | 'whitespace'
    | 'definingAsContext'
    | 'definingForContent'
    | 'defining'
    | 'isolating'
  >;

  toDOM?: NodeSpec['toDOM'];
  parseDOM?: NodeSpec['parseDOM'];
}
