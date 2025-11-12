import { insertNodes, removeNodes } from '../../internal/transforms';
export const transformVoid = (editor, [node, path])=>{
    const validVoid = {
        ...node,
        children: [
            {
                text: ''
            }
        ]
    };
    removeNodes(editor, {
        at: path
    });
    insertNodes(editor, [
        validVoid
    ], {
        at: path
    });
};
