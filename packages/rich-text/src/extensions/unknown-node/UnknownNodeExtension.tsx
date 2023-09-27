import React from 'react';

import { css } from 'emotion';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { WarningIcon } from '@contentful/f36-icons';
import { Flex, Note } from '@contentful/f36-components';

export interface UnknownNodeOptions {
  HTMLAttributes: Record<string, any>;
}

const styles = css`
  width: 100%;
  height: 100%;
  border: 1px solid red;
  background: #f2a8a86e;
  color: black;
  padding: 12px;
  border-radius: 8px;
`;

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    UnknownNode: {
      /**
       * Set a unknown mark
       */
      setUnknownNode: () => ReturnType;
      /**
       * Toggle a unknown mark
       */
      toggleUnknownNode: () => ReturnType;
      /**
       * Unset a unknown mark
       */
      unsetUnknownNode: () => ReturnType;
    };
  }
}

export const UnknownNode = Node.create<UnknownNodeOptions>({
  name: 'unknownNode',
  group: 'block',

  addOptions() {
    return {
      HTMLAttributes: {
        class: styles,
      },
    };
  },

  addAttributes() {
    return {
      originalType: '',
    };
  },

  // parseHTML() {
  //   // dunno
  // },

  addNodeView() {
    return ReactNodeViewRenderer(({ node }) => {
      return (
        <NodeViewWrapper>
          <Note variant="warning">
            Unknown Node: <strong>{node.attrs.originalType}</strong> is not a known node type
          </Note>
        </NodeViewWrapper>
      );
    });
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      // node.attrs.originalType + ' is not a known node type',
    ];
  },
});
