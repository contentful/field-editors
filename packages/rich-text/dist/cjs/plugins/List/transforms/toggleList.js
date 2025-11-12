"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "toggleList", {
    enumerable: true,
    get: function() {
        return toggleList;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _platelist = require("@udecode/plate-list");
const _internal = require("../../../internal");
const _constants = require("../../../internal/constants");
const _queries = require("../../../internal/queries");
const _transforms = require("../../../internal/transforms");
const _unwrapList = require("./unwrapList");
const listTypes = [
    _richtexttypes.BLOCKS.UL_LIST,
    _richtexttypes.BLOCKS.OL_LIST
];
const toggleList = (editor, { type, listStyle })=>(0, _internal.withoutNormalizing)(editor, ()=>{
        if (!editor.selection) {
            return;
        }
        if ((0, _queries.isRangeCollapsed)(editor.selection) || !(0, _queries.isRangeAcrossBlocks)(editor)) {
            const res = (0, _platelist.getListItemEntry)(editor);
            if (res) {
                const { list } = res;
                const currentListStyle = list[0].data?.listStyle;
                const targetListStyle = listStyle || undefined;
                if (list[0].type !== type || currentListStyle !== targetListStyle) {
                    const data = listStyle ? {
                        listStyle
                    } : {};
                    (0, _transforms.setNodes)(editor, {
                        type,
                        data
                    }, {
                        at: editor.selection,
                        match: (n)=>listTypes.includes(n.type),
                        mode: 'lowest'
                    });
                } else {
                    (0, _unwrapList.unwrapList)(editor);
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
                (0, _transforms.wrapNodes)(editor, list);
                const nodes = [
                    ...(0, _queries.getNodeEntries)(editor, {
                        match: {
                            type: (0, _queries.getPluginType)(editor, _constants.ELEMENT_DEFAULT)
                        }
                    })
                ];
                const listItem = {
                    type: _richtexttypes.BLOCKS.LIST_ITEM,
                    children: [],
                    data: {}
                };
                for (const [, path] of nodes){
                    (0, _transforms.wrapNodes)(editor, listItem, {
                        at: path
                    });
                }
            }
        } else {
            const [startPoint, endPoint] = (0, _queries.getRangeEdges)(editor.selection);
            const commonEntry = (0, _queries.getCommonNode)(editor, startPoint.path, endPoint.path);
            if (listTypes.includes(commonEntry[0].type) || commonEntry[0].type === _richtexttypes.BLOCKS.LIST_ITEM) {
                let listType = commonEntry[0].type;
                if (commonEntry[0].type === _richtexttypes.BLOCKS.LIST_ITEM) {
                    listType = (0, _queries.getParentNode)(editor, commonEntry[1])?.[0]?.type;
                }
                const currentListStyle = commonEntry[0].data?.listStyle;
                const targetListStyle = listStyle || undefined;
                if (listType !== type || currentListStyle !== targetListStyle) {
                    const startList = (0, _queries.findNode)(editor, {
                        at: (0, _queries.getRangeStart)(editor.selection),
                        match: {
                            type: listTypes
                        },
                        mode: 'lowest'
                    });
                    const endList = (0, _queries.findNode)(editor, {
                        at: (0, _queries.getRangeEnd)(editor.selection),
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
                    (0, _transforms.setNodes)(editor, {
                        type,
                        data
                    }, {
                        at: editor.selection,
                        match: (n, path)=>listTypes.includes(n.type) && path.length >= rangeLength,
                        mode: 'all'
                    });
                } else {
                    (0, _unwrapList.unwrapList)(editor);
                }
            } else {
                const rootPathLength = commonEntry[1].length;
                const nodes = Array.from((0, _queries.getNodeEntries)(editor, {
                    mode: 'all'
                })).filter(([, path])=>path.length === rootPathLength + 1).reverse();
                nodes.forEach((n)=>{
                    if (listTypes.includes(n[0].type)) {
                        const data = listStyle ? {
                            listStyle
                        } : {};
                        (0, _transforms.setNodes)(editor, {
                            type,
                            data
                        }, {
                            at: n[1]
                        });
                    } else {
                        (0, _transforms.setNodes)(editor, {
                            type: (0, _queries.getPluginType)(editor, _platelist.ELEMENT_LIC)
                        }, {
                            at: n[1]
                        });
                        const listItem = {
                            type: _richtexttypes.BLOCKS.LIST_ITEM,
                            children: [],
                            data: {}
                        };
                        (0, _transforms.wrapNodes)(editor, listItem, {
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
                        (0, _transforms.wrapNodes)(editor, list, {
                            at: n[1]
                        });
                    }
                });
            }
        }
    });
