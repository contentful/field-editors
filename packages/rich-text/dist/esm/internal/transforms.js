import * as p from '@udecode/plate-common';
import { getEndPoint, isNode } from './queries';
export const normalize = (editor, options = {
    force: true
})=>{
    return p.normalizeEditor(editor, options);
};
export const withoutNormalizing = (editor, fn)=>{
    return p.withoutNormalizing(editor, fn);
};
export const setSelection = (editor, props)=>{
    return p.setSelection(editor, props);
};
export const select = (editor, location)=>{
    return p.select(editor, location);
};
export const moveSelection = (editor, options)=>{
    return p.moveSelection(editor, options);
};
export const moveChildren = (editor, options)=>{
    return p.moveChildren(editor, options);
};
export const collapseSelection = (editor, options)=>{
    return p.collapseSelection(editor, options);
};
export const setNodes = (editor, attrs, opts)=>{
    p.setNodes(editor, attrs, opts);
};
export const unsetNodes = (editor, props, options)=>{
    p.unsetNodes(editor, props, options);
};
export const insertNodes = (editor, nodes, opts)=>{
    return p.insertNodes(editor, nodes, opts);
};
export const splitNodes = (editor, options)=>{
    return p.splitNodes(editor, options);
};
export const liftNodes = (editor, options)=>{
    return p.liftNodes(editor, options);
};
export const unwrapNodes = (editor, options)=>{
    return p.unwrapNodes(editor, options);
};
export const wrapNodes = (editor, element, options)=>{
    return p.wrapNodes(editor, element, options);
};
export const toggleNodeType = (editor, options, editorOptions)=>{
    p.toggleNodeType(editor, options, editorOptions);
};
export const removeMark = (editor, type, at)=>{
    p.removeMark(editor, {
        key: type,
        at
    });
};
export const unhangRange = (editor, range, options)=>{
    return p.unhangRange(editor, range, options);
};
export const toggleMark = (editor, options)=>{
    return p.toggleMark(editor, options);
};
export const addMark = (editor, type, value = true)=>{
    p.addMark(editor, type, value);
};
export const insertText = (editor, text, options)=>{
    return p.insertText(editor, text, options);
};
export const deleteText = (editor, opts)=>{
    p.deleteText(editor, opts);
};
export const removeNodes = (editor, opts)=>{
    p.removeNodes(editor, opts);
};
export const moveNodes = (editor, opts)=>{
    p.moveNodes(editor, opts);
};
export const deleteFragment = (editor, options)=>{
    return p.deleteFragment(editor, options);
};
export const setEditorValue = (editor, nodes)=>{
    withoutNormalizing(editor, ()=>{
        const children = [
            ...editor.children
        ];
        children.forEach((node)=>editor.apply({
                type: 'remove_node',
                path: [
                    0
                ],
                node
            }));
        if (nodes) {
            const nodesArray = isNode(nodes) ? [
                nodes
            ] : nodes;
            nodesArray.forEach((node, i)=>{
                editor.apply({
                    type: 'insert_node',
                    path: [
                        i
                    ],
                    node
                });
            });
        }
        const point = getEndPoint(editor, []);
        if (point) {
            select(editor, point);
        }
    });
};
