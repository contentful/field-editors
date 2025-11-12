"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createEmbeddedResourceBlockPlugin", {
    enumerable: true,
    get: function() {
        return createEmbeddedResourceBlockPlugin;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _EmbeddedBlockUtil = require("../shared/EmbeddedBlockUtil");
const _LinkedResourceBlock = require("./LinkedResourceBlock");
const createEmbeddedResourcePlugin = (nodeType, hotkey)=>(sdk)=>({
            key: nodeType,
            type: nodeType,
            isElement: true,
            isVoid: true,
            component: _LinkedResourceBlock.LinkedResourceBlock,
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
                            'data-entity-type': 'Contentful:Entry'
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
                                    urn: el.getAttribute('data-entity-id'),
                                    linkType: el.getAttribute('data-entity-type'),
                                    type: 'ResourceLink'
                                }
                            }
                        }
                    })
            }
        });
const createEmbeddedResourceBlockPlugin = createEmbeddedResourcePlugin(_richtexttypes.BLOCKS.EMBEDDED_RESOURCE, 'mod+shift+s');
