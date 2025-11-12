"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createEmbeddedEntityInlinePlugin", {
    enumerable: true,
    get: function() {
        return createEmbeddedEntityInlinePlugin;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _EmbeddedInlineUtil = require("../shared/EmbeddedInlineUtil");
const _LinkedEntityInline = require("./LinkedEntityInline");
function createEmbeddedEntityInlinePlugin(sdk) {
    const htmlAttributeName = 'data-embedded-entity-inline-id';
    const nodeType = _richtexttypes.INLINES.EMBEDDED_ENTRY;
    return {
        key: nodeType,
        type: nodeType,
        isElement: true,
        isInline: true,
        isVoid: true,
        component: _LinkedEntityInline.LinkedEntityInline,
        options: {
            hotkey: 'mod+shift+2'
        },
        handlers: {
            onKeyDown: (0, _EmbeddedInlineUtil.getWithEmbeddedEntryInlineEvents)(nodeType, sdk)
        },
        deserializeHtml: {
            rules: [
                {
                    validAttribute: htmlAttributeName
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
                    data: {
                        target: {
                            sys: {
                                id: el.getAttribute('data-entity-id'),
                                type: 'Link',
                                linkType: el.getAttribute('data-entity-type')
                            }
                        }
                    }
                })
        }
    };
}
