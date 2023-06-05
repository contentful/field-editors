import { COMMAND_PROMPT } from '../plugins/CommandPalette/constants';

const internalMarks = [COMMAND_PROMPT];

export const removeInternalMarks = (document: Record<string, unknown>) => {
  console.log('After removing comment data ', { document });

  return {
    ...document,
    content: (document.content as Record<string, unknown>[]).map((node) => {
      if (node.nodeType === 'text') {
        node.marks = (node.marks as Record<string, unknown>[]).filter(
          (mark) => !internalMarks.includes(mark.type as string)
        );
        console.log('return node ', node);
        return node;
      }
      return removeInternalMarks(node);
    }),
  };
};
