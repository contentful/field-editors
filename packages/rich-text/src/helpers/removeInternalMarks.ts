import { cloneDeep, get } from 'lodash-es';
import { InlineComment } from 'RichTextEditor';

import { COMMAND_PROMPT } from '../plugins/CommandPalette/constants';
import { INLINE_COMMENT_HIGHLIGHT } from '../plugins/Marks';

const internalMarks = [COMMAND_PROMPT];

export const removeInternalMarks = (document: Record<string, unknown>) => {
  return {
    ...document,
    content: (document.content as Record<string, unknown>[]).map((node) => {
      if (node.nodeType === 'text') {
        node.marks = (node.marks as Record<string, unknown>[]).filter(
          (mark) => !internalMarks.includes(mark.type as string)
        );
        return node;
      }
      return removeInternalMarks(node);
    }),
  };
};

export const removeCommentDataFromDocument = (document2: any): any => {
  const document = cloneDeep(document2);
  if (typeof document !== 'object' || document === null) {
    return document;
  }
  if (
    'data' in document &&
    ('comment' in document.data ||
      ('marks' in document &&
        document.marks.find((mark) => mark.type === INLINE_COMMENT_HIGHLIGHT)))
  ) {
    document.data = {};

    document.marks = document.marks?.filter((mark) => mark.type !== INLINE_COMMENT_HIGHLIGHT);

    return document;
  }

  if (Array.isArray(document)) {
    return document.map((node) => removeCommentDataFromDocument(node));
  } else {
    const newNode: any = {};
    for (const key in document) {
      newNode[key] = removeCommentDataFromDocument(document[key]);
    }
    return newNode;
  }
};

export const enhanceContentfulDocWithComments = (document2: any, comments: InlineComment[]) => {
  console.log('Document before enhancing with comments, ', document2, comments);
  const document = cloneDeep(document2);

  for (let i = 0; i < comments?.length; i++) {
    // this assumes there is only one element in the json path
    const commentedNode = get(document, comments[i].metadata.range[0]);

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
      if (!commentedNode.marks) commentedNode.marks = [];

      if (
        !(commentedNode.marks ?? []).find((mark: any) => mark.type === INLINE_COMMENT_HIGHLIGHT)
      ) {
        commentedNode.marks.push({ type: INLINE_COMMENT_HIGHLIGHT });
        // commentedNode[INLINE_COMMENT_HIGHLIGHT] = true;
      }
    }
    // console.log('commented node', commentedNode);
  }

  console.log('Document after enhancing with comments, ', document);
  return document;
};

export const findRanges = (document: any, path: string, ranges: string[] = []): any => {
  if ('data' in document && 'comment' in document.data && document.data.comment.temp) {
    console.log('PATH FOUND: ', path);

    ranges.push(path);
  }

  if ('content' in document) {
    for (let i = 0; i < document.content.length; i++) {
      if (path.startsWith('.')) {
        path = path.slice(1);
      }
      ranges = ranges.concat(findRanges(document.content[i], `${path}.content[${i}]`, ranges));
    }

    console.log('Finished! ', ranges);

    return Array.from(new Set(ranges.filter((range) => range)));
  }
};
