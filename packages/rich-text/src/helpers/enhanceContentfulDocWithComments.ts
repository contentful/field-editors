import * as Contentful from '@contentful/rich-text-types';
import get from 'lodash.get';

export interface InlineComment {
  metadata: {
    //to ask: should the range just be one path or multiple paths?, insted of a "range"
    range: string[];
    originalText: string;
  };
  body: string; // here the body would actually also be rich text since comments are now rich text
  id: string;
}

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
