"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createEmbeddedResourceInlinePlugin", {
    enumerable: true,
    get: function() {
        return createEmbeddedResourceInlinePlugin;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _EmbeddedInlineUtil = require("../shared/EmbeddedInlineUtil");
const _LinkedResourceInline = require("./LinkedResourceInline");
function createEmbeddedResourceInlinePlugin(sdk) {
    const htmlAttributeName = 'data-embedded-resource-inline-id';
    const nodeType = _richtexttypes.INLINES.EMBEDDED_RESOURCE;
    return {
        key: nodeType,
        type: nodeType,
        isElement: true,
        isInline: true,
        isVoid: true,
        component: _LinkedResourceInline.LinkedResourceInline,
        options: {
            hotkey: 'mod+shift+p'
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
                                urn: el.getAttribute('data-entity-id'),
                                linkType: el.getAttribute('data-entity-type'),
                                type: 'ResourceLink'
                            }
                        }
                    }
                })
        }
    };
}
