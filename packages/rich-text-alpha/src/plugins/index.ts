import { reactKeys } from '@handlewithcare/react-prosemirror';
import { baseKeymap } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import { Schema, type MarkSpec, type NodeSpec } from 'prosemirror-model';
import { EditorState, Plugin } from 'prosemirror-state';

import { Mark, Node } from '../core';
import { LineBreak } from './lineBreak';
import { marks } from './marks';
import { Paragraph } from './paragraph';

const ours = [...marks, new Paragraph(), new LineBreak()];

export function createEditor() {
  const markSchema: Record<string, MarkSpec> = {};
  const nodeSchema: Record<string, NodeSpec> = {
    document: {
      content: 'block+',
    },
    text: {
      group: 'inline',
      inline: true,
    },
  };

  const plugins: Plugin<any>[] = [reactKeys(), keymap(baseKeymap), ...ours];

  for (const p of plugins) {
    if (p instanceof Mark) {
      markSchema[p.name] = p.schema;
    }

    if (p instanceof Node) {
      nodeSchema[p.name] = p.schema;
    }
  }

  const schema = new Schema({
    topNode: 'document',
    marks: markSchema,
    nodes: nodeSchema,
  });

  const state = EditorState.create({
    schema,
    plugins,
  });

  return state;
}
