import { cloneDeep } from 'lodash-es';

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
