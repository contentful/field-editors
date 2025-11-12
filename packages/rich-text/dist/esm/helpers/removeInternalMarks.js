import { COMMAND_PROMPT } from '../plugins/CommandPalette/constants';
const internalMarks = [
    COMMAND_PROMPT
];
export const removeInternalMarks = (document)=>{
    return {
        ...document,
        content: document.content.map((node)=>{
            if (node.nodeType === 'text') {
                node.marks = node.marks.filter((mark)=>!internalMarks.includes(mark.type));
                return node;
            }
            return removeInternalMarks(node);
        })
    };
};
