import { reactKeys } from '@handlewithcare/react-prosemirror';
import { baseKeymap } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import { Schema, type MarkSpec, type NodeSpec } from 'prosemirror-model';
import { EditorState, Plugin } from 'prosemirror-state';

import { buildMark } from '../core';
import { marks } from './marks';

export function createEditor() {
  const markSchema: Record<string, MarkSpec> = {};

  const plugins: Plugin<any>[] = [reactKeys(), keymap(baseKeymap)];

  for (const mark of marks) {
    const { schema, plugin } = buildMark(mark);
    markSchema[mark.name] = schema;

    if (plugin) {
      plugins.push(plugin);
    }
  }

  const schema = new Schema({
    topNode: 'document',
    marks: markSchema,
    nodes: {
      document: {
        content: 'block+',
      } as NodeSpec,

      paragraph: {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'p' }],
        toDOM() {
          return ['p', { style: 'margin-bottom: 1.5em;direction: inherit;' }, 0];
        },
      } as NodeSpec,

      text: {
        group: 'inline',
        inline: true,
      } as NodeSpec,
    },
  });

  const state = EditorState.create({
    schema,
    plugins,
  });

  return state;
}
