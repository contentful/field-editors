"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createListPlugin", {
    enumerable: true,
    get: function() {
        return createListPlugin;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _platelist = require("@udecode/plate-list");
const _transformers = require("../../helpers/transformers");
const _List = require("./components/List");
const _ListItem = require("./components/ListItem");
const _onKeyDownList = require("./onKeyDownList");
const _utils = require("./utils");
const _withList = require("./withList");
const createListPlugin = ()=>(0, _platelist.createListPlugin)({
        normalizer: [
            {
                match: {
                    type: [
                        _richtexttypes.BLOCKS.UL_LIST,
                        _richtexttypes.BLOCKS.OL_LIST
                    ]
                },
                validChildren: [
                    _richtexttypes.BLOCKS.LIST_ITEM
                ],
                transform: (0, _transformers.transformWrapIn)(_richtexttypes.BLOCKS.LIST_ITEM)
            }
        ],
        overrideByKey: {
            [_platelist.ELEMENT_UL]: {
                type: _richtexttypes.BLOCKS.UL_LIST,
                component: _List.ListUL,
                handlers: {
                    onKeyDown: _onKeyDownList.onKeyDownList
                },
                withOverrides: _withList.withList
            },
            [_platelist.ELEMENT_OL]: {
                type: _richtexttypes.BLOCKS.OL_LIST,
                component: _List.ListOL,
                handlers: {
                    onKeyDown: _onKeyDownList.onKeyDownList
                }
            },
            [_platelist.ELEMENT_LIC]: {
                type: _richtexttypes.BLOCKS.PARAGRAPH
            },
            [_platelist.ELEMENT_LI]: {
                type: _richtexttypes.BLOCKS.LIST_ITEM,
                component: _ListItem.ListItem,
                normalizer: [
                    {
                        validNode: _utils.hasListAsDirectParent,
                        transform: _utils.normalizeOrphanedListItem
                    },
                    {
                        validNode: _utils.isNonEmptyListItem,
                        transform: _utils.insertParagraphAsChild
                    },
                    {
                        validChildren: _richtexttypes.LIST_ITEM_BLOCKS,
                        transform: _transformers.transformParagraphs
                    },
                    {
                        validNode: _utils.firstNodeIsNotList,
                        transform: _utils.replaceNodeWithListItems
                    }
                ]
            }
        }
    });
