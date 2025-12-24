import { reactKeys } from '@handlewithcare/react-prosemirror';
import { baseKeymap } from 'prosemirror-commands';
import { keydownHandler } from 'prosemirror-keymap';
import { Schema, type MarkSpec, type NodeSpec } from 'prosemirror-model';
import { EditorState, Plugin, PluginKey } from 'prosemirror-state';

import { Mark, Node } from '../core';
import { Blockquote } from './blockquote';
import { LineBreak } from './lineBreak';
import { marks } from './marks';
import { Paragraph } from './paragraph';

const corePlugins = [
  reactKeys(),
  new Plugin({
    key: new PluginKey('baseKeymap'),
    props: {
      handleKeyDown: keydownHandler(baseKeymap),
    },
  }),
];

export function createEditor() {
  const markSchema: Record<string, MarkSpec> = {};
  const nodeSchema: Record<string, NodeSpec> = {
    document: {
      content: '(paragraph | top_level_block)+',
    },
    text: {
      group: 'inline',
      inline: true,
    },
  };

  const plugins: Plugin<any>[] = [
    ...corePlugins,
    ...marks,
    new Paragraph(),
    new LineBreak(),
    new Blockquote(),
  ];

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
