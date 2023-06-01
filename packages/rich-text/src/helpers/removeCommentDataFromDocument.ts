import { INLINE_COMMENT_HIGHLIGHT } from 'plugins/Marks';

export const removeCommentDataFromDocument = (document: any): any => {
  if (typeof document !== 'object' || document === null) {
    return document;
  }
  if ('comment' in document.data) {
    document.data = {};
    const indexOfMark = document.marks.indexOf({ type: INLINE_COMMENT_HIGHLIGHT });
    if (indexOfMark > -1) {
      document.marks.splice(indexOfMark, 1);
    }
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
