import { BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';
import { getAboveNode, isAncestorEmpty, getNodeEntries, getPointBefore, isInline, isEndPoint, getPointAfter, isRangeCollapsed, queryNode, isText } from '../../internal/queries';
import { setSelection, select, removeNodes, splitNodes, unhangRange, unsetNodes } from '../../internal/transforms';
export function createTextPlugin(restrictedMarks = []) {
    return {
        key: 'TextPlugin',
        handlers: {
            onMouseUp: (editor)=>()=>{
                    if (!editor.selection) {
                        return;
                    }
                    setSelection(editor, unhangRange(editor, editor.selection));
                }
        },
        withOverrides: (editor)=>{
            const { insertText } = editor;
            editor.insertText = (text)=>{
                const { selection } = editor;
                if (selection && isRangeCollapsed(selection)) {
                    const inlinePath = getAboveNode(editor, {
                        match: (n)=>isInline(editor, n),
                        mode: 'highest'
                    })?.[1];
                    if (inlinePath && isEndPoint(editor, selection.anchor, inlinePath)) {
                        const point = getPointAfter(editor, inlinePath);
                        setSelection(editor, {
                            anchor: point,
                            focus: point
                        });
                    }
                }
                return insertText(text);
            };
            const { deleteForward, deleteBackward } = editor;
            editor.deleteBackward = (unit)=>{
                deleteEmptyParagraph(unit, editor, deleteBackward);
            };
            editor.deleteForward = (unit)=>{
                deleteEmptyParagraph(unit, editor, deleteForward);
            };
            fixPasteAsPlainText(editor);
            return editor;
        },
        normalizer: [
            {
                match: isText,
                transform: (editor, [, path])=>{
                    unsetNodes(editor, restrictedMarks, {
                        at: path
                    });
                },
                validNode: (_editor, [node])=>{
                    return !restrictedMarks.some((mark)=>{
                        return mark in node;
                    });
                }
            }
        ]
    };
}
function deleteEmptyParagraph(unit, editor, deleteFunction) {
    const entry = getAboveNode(editor, {
        match: {
            type: TEXT_CONTAINERS
        }
    });
    if (entry) {
        const [paragraphOrHeading, path] = entry;
        const isTextEmpty = isAncestorEmpty(editor, paragraphOrHeading);
        const isRootLevel = path.length === 1;
        const hasSiblings = editor.children.length > 1;
        if (isTextEmpty && isRootLevel && hasSiblings) {
            removeNodes(editor, {
                at: path
            });
            const prevNode = getPointBefore(editor, editor.selection, {
                unit
            });
            if (prevNode) {
                const [prevCell] = getNodeEntries(editor, {
                    match: (node)=>queryNode([
                            node,
                            prevNode.path
                        ], {
                            allow: [
                                BLOCKS.EMBEDDED_ASSET,
                                BLOCKS.EMBEDDED_ENTRY,
                                BLOCKS.EMBEDDED_RESOURCE,
                                BLOCKS.HR
                            ]
                        }),
                    at: prevNode
                });
                if (prevCell) {
                    select(editor, prevNode);
                }
            }
        } else {
            deleteFunction(unit);
        }
    } else {
        deleteFunction(unit);
    }
}
function fixPasteAsPlainText(editor) {
    editor.insertTextData = (data)=>{
        const text = data.getData('text/plain');
        if (!text) {
            return false;
        }
        const lines = text.split(/\n{2}/);
        let split = false;
        for (const line of lines){
            if (/^(\r\n?|\n)$/.test(line)) {
                continue;
            }
            if (split) {
                splitNodes(editor, {
                    always: true
                });
            }
            editor.insertText(line);
            split = true;
        }
        return true;
    };
}
