import { INLINE_COMMENT_HIGHLIGHT } from '../plugins/Marks/helpers';

export const removeCommentDataFromDocument = (document: any): any => {
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

    document.marks = document.marks.filter((mark) => mark.type !== INLINE_COMMENT_HIGHLIGHT);

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
