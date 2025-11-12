import { insertNodes, removeNodes, unwrapNodes, wrapNodes, liftNodes } from '../internal/transforms';
import { extractParagraphs } from './extractNodes';
export const transformRemove = (editor, [, path])=>{
    removeNodes(editor, {
        at: path
    });
};
export const transformParagraphs = (editor, entry)=>{
    const path = entry[1];
    const nodes = extractParagraphs(editor, path);
    transformRemove(editor, entry);
    insertNodes(editor, nodes, {
        at: path
    });
};
export const transformUnwrap = (editor, [, path])=>{
    unwrapNodes(editor, {
        at: path
    });
};
export const transformWrapIn = (type)=>(editor, [, path])=>{
        wrapNodes(editor, {
            type,
            data: {},
            children: []
        }, {
            at: path
        });
    };
export const transformLift = (editor, [, path])=>{
    liftNodes(editor, {
        at: path
    });
};
