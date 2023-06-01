import { COMMAND_PROMPT } from '../plugins/CommandPalette/constants';
import { removeCommentDataFromDocument } from './removeCommentDataFromDocument';

const internalMarks = [COMMAND_PROMPT];

export const removeInternalMarks = (document: Record<string, unknown>) => {
  document = removeCommentDataFromDocument(document);
  console.log('DOCUMENT BEFORE SAVING ', { document });

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
