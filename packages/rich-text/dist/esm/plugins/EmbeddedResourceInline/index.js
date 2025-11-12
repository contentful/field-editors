import { INLINES } from '@contentful/rich-text-types';
import { getWithEmbeddedEntryInlineEvents } from '../shared/EmbeddedInlineUtil';
import { LinkedResourceInline } from './LinkedResourceInline';
export function createEmbeddedResourceInlinePlugin(sdk) {
    const htmlAttributeName = 'data-embedded-resource-inline-id';
    const nodeType = INLINES.EMBEDDED_RESOURCE;
    return {
        key: nodeType,
        type: nodeType,
        isElement: true,
        isInline: true,
        isVoid: true,
        component: LinkedResourceInline,
        options: {
            hotkey: 'mod+shift+p'
        },
        handlers: {
            onKeyDown: getWithEmbeddedEntryInlineEvents(nodeType, sdk)
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
