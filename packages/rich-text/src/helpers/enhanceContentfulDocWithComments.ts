import * as Contentful from '@contentful/rich-text-types';
import get from 'lodash.get';
import { InlineComment } from 'RichTextEditor';

export const enhanceContentfulDocWithComments = (
  document: Contentful.Document,
  comments: InlineComment[]
) => {
  for (let i = 0; i < comments?.length; i++) {
    // this assumes there is only one element in the json path
    const commentedNode = get(document, comments[i].metadata.range[0]);
    if (commentedNode && commentedNode.data) {
      commentedNode.data = {
        comment: {
          sys: {
            type: 'Link',
            linkType: 'Comment',
            id: comments[i].id,
          },
        },
      };
    }
    console.log('commented node', commentedNode);
  }
  return document;
};