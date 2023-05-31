import { InlineComment } from 'RichTextEditor';

export const findCurrentComments = (
  document: any,
  comments: (InlineComment & { newRange?: string[] })[],
  path: string
): string | null => {
  if ('data' in document && 'comment' in document.data) {
    const oldComment = comments.find((comment) => {
      return comment.id === document.data.comment.sys.id;
    });

    if (oldComment) {
      if ('newRange' in oldComment.metadata) {
        (oldComment.metadata.newRange as string[]).push(path);
      } else {
        oldComment.newRange = [path];
      }
      // check if path is already in locations
      if (!oldComment.metadata.range.includes(path)) {
        oldComment.metadata.range.push(path);
      }
    }
  }

  if ('content' in document) {
    for (let i = 0; i < document.content.length; i++) {
      if (path.startsWith('.')) {
        path = path.slice(1);
      }
      const subPath = findCurrentComments(document.content[i], comments, `${path}.content[${i}]`);
      if (subPath !== null) {
        return `content[${i}].${path}`;
      }
    }
  }

  return null;
};
export const getUpdatedComments = (
  document: any,
  comments: (InlineComment & { newRange?: string[] })[]
): InlineComment[] => {
  findCurrentComments(document, comments, '');

  return comments.map((comment) => {
    if (comment.newRange && comment.metadata.range.sort() !== comment.newRange?.sort()) {
      comment.metadata.range = comment.newRange;
    }
    delete comment.newRange;

    // todo: perform database action on comment, remove comments that dont have any ranges
    return comment;
  });
};
