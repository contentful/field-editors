import React from 'react';

import { ChatBubbleIcon } from '@contentful/f36-icons';
import { MARKS } from '@contentful/rich-text-types';
import { css } from 'emotion';
import { BaseEditor, Node, Transforms } from 'slate';
import { RenderLeafProps } from 'slate-react';

import { findRanges } from '../../helpers/getUpdatedComments';
import { createMarkToolbarButton } from './components/MarkToolbarButton';

export const ToolbarInlineCommentButton = createMarkToolbarButton({
  title: 'inline-comments',
  mark: 'inline-comment' as unknown as MARKS, // change this once rich text types are updated. Requierement defined
  icon: <ChatBubbleIcon />,
  callback: (sdk, editor) => {
    const data = { comment: { temp: true } };
    const selection = editor.selection;

    // Apply the mark and data properties to the selected children

    // eslint-disable-next-line -- TODO: describe this disabl
    Transforms.setNodes(editor as BaseEditor, { data } as Partial<Node>, {
      at: selection?.anchor.path,
    });

    console.log('Slate state: ', editor.children);

    const ranges = findRanges(editor, '', []);
    console.log({ ranges });

    // window.Editor = Editor;
    (window as any).editor = editor;
    //
    sdk.field.comments.create(ranges);
  },
});

const styles = {
  inlineComment: css({
    background: '#C4E7FF',
    fontWeight: 'normal',
  }),
};

export const InlineComment = ({ children, attributes }: RenderLeafProps) => {
  return (
    <mark {...attributes} className={styles.inlineComment}>
      {children}
    </mark>
  );
};
