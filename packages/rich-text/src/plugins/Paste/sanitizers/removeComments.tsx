import { removeChildNodesUsingPredicate, SanitizerTuple } from './helpers';

const isComment = (node: ChildNode): node is Comment => node.nodeType === Node.COMMENT_NODE;

const removeCommentChildren = removeChildNodesUsingPredicate(isComment);

export const removeComments = ([doc, editor]: SanitizerTuple): SanitizerTuple => {
  removeCommentChildren(doc.childNodes);
  return [doc, editor];
};
