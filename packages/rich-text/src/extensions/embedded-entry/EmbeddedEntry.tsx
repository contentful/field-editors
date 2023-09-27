import React from 'react';

import { EntryCard } from '@contentful/f36-components';
import { BLOCKS } from '@contentful/rich-text-types';
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';

export const EmbeddedEntry = Node.create({
  name: BLOCKS.EMBEDDED_ENTRY,
  group: 'block',
  draggable: true,
  inline: false,

  addAttributes() {
    return {
      target: {},
    };
  },

  addNodeView() {
    console.log('addNodeView');
    return ReactNodeViewRenderer(({ node }) => (
      <NodeViewWrapper>
        <div data-drag-handle>
          <EntryCard title={node.attrs.target.sys.id} description="Mock description" />
        </div>
      </NodeViewWrapper>
    ));
  },

  parseHTML() {
    return [{ tag: BLOCKS.EMBEDDED_ENTRY }];
  },

  renderHTML({ HTMLAttributes }) {
    return [BLOCKS.EMBEDDED_ENTRY, mergeAttributes(HTMLAttributes)];
  },
});
