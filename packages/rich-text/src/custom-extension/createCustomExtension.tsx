import React from 'react';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';

type CreateCustomNodeProps = {
  name: string;
  options?: {
    draggable?: boolean;
    inline?: boolean;
    attrs?: Record<string, any>;
  };
  render: Function;
};

export const createCustomNode = ({ name, render, options = {} }: CreateCustomNodeProps) =>
  Node.create({
    name,
    group: 'block',
    ...options,

    addAttributes() {
      return {
        ...options.attrs,
      };
    },

    addNodeView() {
      return ReactNodeViewRenderer(({ node }) => <NodeViewWrapper>{render(node)}</NodeViewWrapper>);
    },

    parseHTML() {
      return [{ tag: name }];
    },

    renderHTML({ HTMLAttributes }) {
      return [name, mergeAttributes(HTMLAttributes)];
    },
  });
