import React from 'react';

import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';
import { ChatBubbleIcon } from '@contentful/f36-icons';
import { MARKS } from '@contentful/rich-text-types';
import { css } from 'emotion';
import { BaseEditor, Transforms, Node } from 'slate';
import { RenderLeafProps } from 'slate-react';

import { findRanges } from '../../helpers/removeInternalMarks';
import { createMarkToolbarButton } from './components/MarkToolbarButton';

export const ToolbarInlineCommentButton = createMarkToolbarButton({
  title: 'InlineComment',
  mark: 'inline-comment' as unknown as MARKS,
  icon: <ChatBubbleIcon />,
  callback: (sdk, editor) => {
    const data = { comment: { temp: true } };
    const selection = editor.selection;

    // Apply the mark and data properties to the selected children

    // eslint-disable-next-line -- TODO: describe this disabl
    Transforms.setNodes(editor as BaseEditor, { data } as Partial<Node>, {
      at: selection?.anchor.path,
    });

    const ranges = findRanges(toContentfulDocument({ document: editor.children }), '', []);
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
