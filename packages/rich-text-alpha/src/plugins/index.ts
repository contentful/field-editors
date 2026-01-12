import type { ComponentType } from 'react';

import type { FieldAppSDK } from '@contentful/app-sdk';
import tokens from '@contentful/f36-tokens';
import { reactKeys, type NodeViewComponentProps } from '@handlewithcare/react-prosemirror';
import { dropCursor } from 'prosemirror-dropcursor';
import { gapCursor } from 'prosemirror-gapcursor';
import { history } from 'prosemirror-history';
import { Schema, type MarkSpec, type NodeSpec } from 'prosemirror-model';
import { EditorState, Plugin } from 'prosemirror-state';

import { Mark, Node } from '../core';
import { Blockquote } from './blockquote';
import { Document } from './document';
import { embeds } from './embeds';
import { Heading } from './heading';
import { HorizontalRule } from './hr';
import { Keymap } from './keymap';
import { LineBreak } from './lineBreak';
import { Link } from './link';
import { marks } from './marks';
import { Paragraph } from './paragraph';
import { Text } from './text';

export function createEditor(sdk: FieldAppSDK) {
  const markSchema: Record<string, MarkSpec> = {};
  const nodeSchema: Record<string, NodeSpec> = {};
  const nodeViews: Record<string, ComponentType<NodeViewComponentProps>> = {};

  const plugins: Plugin<any>[] = [
    reactKeys(),
    history(),
    gapCursor(),
    dropCursor({
      color: tokens.colorPrimary,
      width: 2,
    }),
    new Keymap(),
    new Document(sdk),
    new Paragraph(sdk),
    new Text(sdk),
    ...marks(sdk),
    new LineBreak(sdk),
    new HorizontalRule(sdk),
    new Blockquote(sdk),
    new Heading(sdk),
    new Link(sdk),
    ...embeds(sdk),
  ];

  for (const p of plugins) {
    if (p instanceof Mark) {
      markSchema[p.name] = p.schema;
    }

    if (p instanceof Node) {
      nodeSchema[p.name] = p.schema;

      if (p.component) {
        nodeViews[p.name] = p.component;
      }
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

  return { state, nodeViews };
}
