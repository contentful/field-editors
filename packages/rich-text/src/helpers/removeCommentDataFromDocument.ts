export const removeCommentDataFromDocument = (document: any): any => {
  if (typeof document !== 'object' || document === null) {
    return document;
  }
  if ('comment' in document) {
    return {};
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
