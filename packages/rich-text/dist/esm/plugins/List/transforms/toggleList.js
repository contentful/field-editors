import { BLOCKS } from '@contentful/rich-text-types';
import { ELEMENT_LIC } from '@udecode/plate-list';
import { getListItemEntry } from '@udecode/plate-list';
import { withoutNormalizing } from '../../../internal';
import { ELEMENT_DEFAULT } from '../../../internal/constants';
import { findNode, getNodeEntries, isRangeCollapsed, getRangeEdges, isRangeAcrossBlocks, getParentNode, getPluginType, getCommonNode, getRangeStart, getRangeEnd } from '../../../internal/queries';
import { setNodes, wrapNodes } from '../../../internal/transforms';
import { unwrapList } from './unwrapList';
const listTypes = [
    BLOCKS.UL_LIST,
    BLOCKS.OL_LIST
];
export const toggleList = (editor, { type, listStyle })=>withoutNormalizing(editor, ()=>{
        if (!editor.selection) {
            return;
        }
        if (isRangeCollapsed(editor.selection) || !isRangeAcrossBlocks(editor)) {
            const res = getListItemEntry(editor);
            if (res) {
                const { list } = res;
                const currentListStyle = list[0].data?.listStyle;
                const targetListStyle = listStyle || undefined;
                if (list[0].type !== type || currentListStyle !== targetListStyle) {
                    const data = listStyle ? {
                        listStyle
                    } : {};
                    setNodes(editor, {
                        type,
                        data
                    }, {
                        at: editor.selection,
                        match: (n)=>listTypes.includes(n.type),
                        mode: 'lowest'
                    });
                } else {
                    unwrapList(editor);
                }
            } else {
                const data = listStyle ? {
                    listStyle
                } : {};
                const list = {
                    type,
                    children: [],
                    data
                };
                wrapNodes(editor, list);
                const nodes = [
                    ...getNodeEntries(editor, {
                        match: {
                            type: getPluginType(editor, ELEMENT_DEFAULT)
                        }
                    })
                ];
                const listItem = {
                    type: BLOCKS.LIST_ITEM,
                    children: [],
                    data: {}
                };
                for (const [, path] of nodes){
                    wrapNodes(editor, listItem, {
                        at: path
                    });
                }
            }
        } else {
            const [startPoint, endPoint] = getRangeEdges(editor.selection);
            const commonEntry = getCommonNode(editor, startPoint.path, endPoint.path);
            if (listTypes.includes(commonEntry[0].type) || commonEntry[0].type === BLOCKS.LIST_ITEM) {
                let listType = commonEntry[0].type;
                if (commonEntry[0].type === BLOCKS.LIST_ITEM) {
                    listType = getParentNode(editor, commonEntry[1])?.[0]?.type;
                }
                const currentListStyle = commonEntry[0].data?.listStyle;
                const targetListStyle = listStyle || undefined;
                if (listType !== type || currentListStyle !== targetListStyle) {
                    const startList = findNode(editor, {
                        at: getRangeStart(editor.selection),
                        match: {
                            type: listTypes
                        },
                        mode: 'lowest'
                    });
                    const endList = findNode(editor, {
                        at: getRangeEnd(editor.selection),
                        match: {
                            type: listTypes
                        },
                        mode: 'lowest'
                    });
                    if (!startList || !endList) {
                        return;
                    }
                    const rangeLength = Math.min(startList[1].length, endList[1].length);
                    const data = listStyle ? {
                        listStyle
                    } : {};
                    setNodes(editor, {
                        type,
                        data
                    }, {
                        at: editor.selection,
                        match: (n, path)=>listTypes.includes(n.type) && path.length >= rangeLength,
                        mode: 'all'
                    });
                } else {
                    unwrapList(editor);
                }
            } else {
                const rootPathLength = commonEntry[1].length;
                const nodes = Array.from(getNodeEntries(editor, {
                    mode: 'all'
                })).filter(([, path])=>path.length === rootPathLength + 1).reverse();
                nodes.forEach((n)=>{
                    if (listTypes.includes(n[0].type)) {
                        const data = listStyle ? {
                            listStyle
                        } : {};
                        setNodes(editor, {
                            type,
                            data
                        }, {
                            at: n[1]
                        });
                    } else {
                        setNodes(editor, {
                            type: getPluginType(editor, ELEMENT_LIC)
                        }, {
                            at: n[1]
                        });
                        const listItem = {
                            type: BLOCKS.LIST_ITEM,
                            children: [],
                            data: {}
                        };
                        wrapNodes(editor, listItem, {
                            at: n[1]
                        });
                        const data = listStyle ? {
                            listStyle
                        } : {};
                        const list = {
                            type,
                            children: [],
                            data
                        };
                        wrapNodes(editor, list, {
                            at: n[1]
                        });
                    }
                });
            }
        }
    });
