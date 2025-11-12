"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    createEmbeddedAssetBlockPlugin: function() {
        return createEmbeddedAssetBlockPlugin;
    },
    createEmbeddedEntryBlockPlugin: function() {
        return createEmbeddedEntryBlockPlugin;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _EmbeddedBlockUtil = require("../shared/EmbeddedBlockUtil");
const _LinkedEntityBlock = require("./LinkedEntityBlock");
const entityTypes = {
    [_richtexttypes.BLOCKS.EMBEDDED_ENTRY]: 'Entry',
    [_richtexttypes.BLOCKS.EMBEDDED_ASSET]: 'Asset'
};
const createEmbeddedEntityPlugin = (nodeType, hotkey)=>(sdk)=>({
            key: nodeType,
            type: nodeType,
            isElement: true,
            isVoid: true,
            component: _LinkedEntityBlock.LinkedEntityBlock,
            options: {
                hotkey
            },
            handlers: {
                onKeyDown: (0, _EmbeddedBlockUtil.getWithEmbeddedBlockEvents)(nodeType, sdk)
            },
            deserializeHtml: {
                rules: [
                    {
                        validAttribute: {
                            'data-entity-type': entityTypes[nodeType]
                        }
                    }
                ],
                withoutChildren: true,
                getNode: (el)=>({
                        type: nodeType,
                        children: [
                            {
                                text: ''
                            }
                        ],
                        isVoid: true,
                        data: {
                            target: {
                                sys: {
                                    id: el.getAttribute('data-entity-id'),
                                    linkType: el.getAttribute('data-entity-type'),
                                    type: 'Link'
                                }
                            }
                        }
                    })
            }
        });
const createEmbeddedEntryBlockPlugin = createEmbeddedEntityPlugin(_richtexttypes.BLOCKS.EMBEDDED_ENTRY, 'mod+shift+e');
const createEmbeddedAssetBlockPlugin = createEmbeddedEntityPlugin(_richtexttypes.BLOCKS.EMBEDDED_ASSET, 'mod+shift+a');
