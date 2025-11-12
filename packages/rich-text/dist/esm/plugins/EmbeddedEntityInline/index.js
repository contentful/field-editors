import { INLINES } from '@contentful/rich-text-types';
import { getWithEmbeddedEntryInlineEvents } from '../shared/EmbeddedInlineUtil';
import { LinkedEntityInline } from './LinkedEntityInline';
export function createEmbeddedEntityInlinePlugin(sdk) {
    const htmlAttributeName = 'data-embedded-entity-inline-id';
    const nodeType = INLINES.EMBEDDED_ENTRY;
    return {
        key: nodeType,
        type: nodeType,
        isElement: true,
        isInline: true,
        isVoid: true,
        component: LinkedEntityInline,
        options: {
            hotkey: 'mod+shift+2'
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
