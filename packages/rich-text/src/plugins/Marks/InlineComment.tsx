import React from 'react';

import { ChatBubbleIcon } from '@contentful/f36-icons';
import { MARKS } from '@contentful/rich-text-types';
import { css } from 'emotion';
import { RenderLeafProps } from 'slate-react';

import { createMarkToolbarButton } from './components/MarkToolbarButton';

export const ToolbarInlineCommentButton = createMarkToolbarButton({
  title: 'inline-comments',
  mark: 'inline-comments' as unknown as MARKS, // change this once rich text types are updated. Requierement defined
  icon: <ChatBubbleIcon />,
});

const styles = {
  inlineComment: css({
    background: '#C4E7FF',
  }),
};

export const InlineComment = ({ children, attributes }: RenderLeafProps) => {
  return (
    <mark {...attributes} className={styles.inlineComment}>
      {children}
    </mark>
  );
};
