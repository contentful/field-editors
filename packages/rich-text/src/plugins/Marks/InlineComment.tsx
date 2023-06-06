import React from 'react';

import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';
import { ChatBubbleIcon } from '@contentful/f36-icons';
import { MARKS } from '@contentful/rich-text-types';
import { css } from 'emotion';
import { BaseEditor, Transforms, Node } from 'slate';
import { RenderLeafProps } from 'slate-react';

import { findRanges } from '../../helpers/removeInternalMarks';
import { useSdkContext } from '../../SdkProvider';
import { createMarkToolbarButton } from './components/MarkToolbarButton';

export const ToolbarInlineCommentButton = createMarkToolbarButton({
  title: 'InlineComment',
  mark: 'inline-comment' as unknown as MARKS,
  icon: <ChatBubbleIcon />,
  callback: (sdk, editor) => {
    const data = { comment: { temp: true } };

    // eslint-disable-next-line -- TODO: describe this disabl
    Transforms.setNodes(editor as BaseEditor, { data } as Partial<Node>, {
      match: (node) => {
        return typeof (node as any).text !== 'undefined';
      },
    });

    const ranges = findRanges(toContentfulDocument({ document: editor.children }), '', []);

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
    cursor: 'pointer',
  }),
};

export const InlineComment = ({ children, attributes }: RenderLeafProps) => {
  const sdk = useSdkContext();

  const onClick = () => {
    const props = children.props;
    console.log('Trying to focus comment...', children.props);

    if (props.text?.data.comment?.sys?.id) {
      sdk.field.comments.open(props.text?.data?.comment?.sys?.id);
    }
  };

  /* eslint-disable */
  return (
    <mark {...attributes} className={styles.inlineComment} onClick={onClick}>
      {children}
    </mark>
  );
  /* eslint-enable */
};
