import { reactKeys } from '@handlewithcare/react-prosemirror';
import { dropCursor } from 'prosemirror-dropcursor';
import { gapCursor } from 'prosemirror-gapcursor';
import { Schema, type MarkSpec, type NodeSpec } from 'prosemirror-model';
import { EditorState, Plugin } from 'prosemirror-state';

import { Mark, Node } from '../core';
import { Blockquote } from './blockquote';
import { Document } from './document';
import { HorizontalRule } from './horizontalRule';
import { LineBreak } from './lineBreak';
import { Bold, Code, Italic, Strikethrough, Subscript, Superscript, Underline } from './marks';
import { Paragraph } from './paragraph';
import { Text } from './text';

import 'prosemirror-gapcursor/style/gapcursor.css';

export function createEditor() {
  const markSchema: Record<string, MarkSpec> = {};
  const nodeSchema: Record<string, NodeSpec> = {};

  const plugins: Plugin<any>[] = [
    reactKeys(),
    gapCursor(),
    dropCursor(),
    new Document(),
    new Paragraph(),
    new Text(),
    new Bold(),
    new Code(),
    new Italic(),
    new Underline(),
    new Superscript(),
    new Subscript(),
    new Strikethrough(),
    new LineBreak(),
    new Blockquote(),
    new HorizontalRule(),
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
