import { BLOCKS } from '@contentful/rich-text-types';
import { getWithEmbeddedBlockEvents } from '../shared/EmbeddedBlockUtil';
import { LinkedEntityBlock } from './LinkedEntityBlock';
const entityTypes = {
    [BLOCKS.EMBEDDED_ENTRY]: 'Entry',
    [BLOCKS.EMBEDDED_ASSET]: 'Asset'
};
const createEmbeddedEntityPlugin = (nodeType, hotkey)=>(sdk)=>({
            key: nodeType,
            type: nodeType,
            isElement: true,
            isVoid: true,
            component: LinkedEntityBlock,
            options: {
                hotkey
            },
            handlers: {
                onKeyDown: getWithEmbeddedBlockEvents(nodeType, sdk)
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
export const createEmbeddedEntryBlockPlugin = createEmbeddedEntityPlugin(BLOCKS.EMBEDDED_ENTRY, 'mod+shift+e');
export const createEmbeddedAssetBlockPlugin = createEmbeddedEntityPlugin(BLOCKS.EMBEDDED_ASSET, 'mod+shift+a');
