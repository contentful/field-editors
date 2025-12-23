import { keydownHandler } from 'prosemirror-keymap';
import type { MarkSpec } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';
import { Plugin, PluginSpec, PluginKey } from 'prosemirror-state';

export interface Mark {
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
  groups?: string[];

  schema?: Pick<MarkSpec, 'attrs' | 'inclusive' | 'excludes' | 'spanning' | 'code'>;

  toDOM?: MarkSpec['toDOM'];
  parseDOM?: MarkSpec['parseDOM'];

  keymap?: Record<string, Command>;
}

export function buildMark(mark: Mark) {
  const schema: MarkSpec = {
    ...mark.schema,
    toDOM: mark.toDOM,
    parseDOM: mark.parseDOM,
    group: mark.groups?.join(' '),
  };

  const pluginSpec: PluginSpec<unknown> = {
    key: new PluginKey(mark.name),
  };

  if (mark.keymap) {
    pluginSpec.props = {
      ...pluginSpec.props,
      handleKeyDown: keydownHandler(mark.keymap),
    };
  }

  return { schema, plugin: new Plugin(pluginSpec) };
}
