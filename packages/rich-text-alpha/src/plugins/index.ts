import { reactKeys } from '@handlewithcare/react-prosemirror';
import { Schema, type MarkSpec, type NodeSpec } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';

import { buildMark } from '../core';
import { marks } from './marks';

export function createEditor() {
  const markSchema: Record<string, MarkSpec> = {};

  for (const mark of marks) {
    const { schema } = buildMark(mark);
    markSchema[mark.name] = schema;
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
          return ['p', 0];
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
    plugins: [reactKeys()],
  });

  return state;
}
