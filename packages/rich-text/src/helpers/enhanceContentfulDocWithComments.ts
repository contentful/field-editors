import { Document } from '@contentful/rich-text-types';
import get from 'lodash.get';

import { INLINE_COMMENT_HIGHLIGHT } from '../plugins/Marks/helpers';
import { InlineComment } from '../RichTextEditor';

export const enhanceContentfulDocWithComments = (document: Document, comments: InlineComment[]) => {
  console.log('enhanceContentfulDocWithComments, ', document);

  for (let i = 0; i < comments?.length; i++) {
    // this assumes there is only one element in the json path
    const commentedNode = get({ children: document }, comments[i].metadata.range[0]);
    if (commentedNode) {
      commentedNode.data = {
        ...(commentedNode.data ?? {}),
        comment: {
          sys: {
            type: 'Link',
            linkType: 'Comment',
            id: comments[i].sys.id,
          },
        },
      };
      console.log('Enhancing: ', commentedNode);

      // if (
      //   !(commentedNode.marks ?? []).find((mark: any) => mark.type === INLINE_COMMENT_HIGHLIGHT)
      // ) {
      // if (!commentedNode.marks) commentedNode.marks = [];

      // commentedNode.marks.push({ type: INLINE_COMMENT_HIGHLIGHT });
      commentedNode[INLINE_COMMENT_HIGHLIGHT] = true;
      // }
    }
    console.log('commented node', commentedNode);
  }
  return document;
};
