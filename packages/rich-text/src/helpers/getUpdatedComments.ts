import { InlineComment } from 'RichTextEditor';

export const findCurrentComments = (
  document: any,
  path: string,
  comments: (InlineComment & { newRange?: string[] })[]
): string | null => {
  if ('data' in document && 'comment' in document.data) {
    const oldComment = comments.find((comment) => {
      return comment.sys.id === document.data.comment.sys.id;
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
  commentsSdk: {
    get: () => InlineComment[];
    create: () => void;
    update: (commentId: string, comment: InlineComment) => void;
    delete: (commentId: string) => void;
  }
): InlineComment[] => {
  const currentComments = commentsSdk.get() as (InlineComment & { newRange?: string[] })[];
  findCurrentComments(document, '', currentComments);

  return currentComments.map((comment) => {
    if (comment.newRange && comment.metadata.range.sort() !== comment.newRange?.sort()) {
      if (comment.newRange.length === 0) {
        // comment no longer exists, delete
        commentsSdk.delete(comment.sys.id);
      } else {
        // update comment
        comment.metadata.range = comment.newRange;
        delete comment.newRange;

        // probably won't work?
        commentsSdk.update(comment.sys.id, comment);
      }
    }

    return comment;
  });
};
