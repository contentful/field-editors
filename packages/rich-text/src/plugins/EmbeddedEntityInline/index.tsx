import { FieldAppSDK } from '@contentful/app-sdk';
import { INLINES } from '@contentful/rich-text-types';

import { PlatePlugin, Node } from '../../internal/types';
import { getWithEmbeddedEntryInlineEvents } from '../shared/EmbeddedInlineUtil';
import { LinkedEntityInline } from './LinkedEntityInline';

export function createEmbeddedEntityInlinePlugin(sdk: FieldAppSDK): PlatePlugin {
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
      hotkey: 'mod+shift+2',
    },
    handlers: {
      onKeyDown: getWithEmbeddedEntryInlineEvents(nodeType, sdk),
    },
    deserializeHtml: {
      rules: [
        {
          validAttribute: htmlAttributeName,
        },
      ],
      withoutChildren: true,
      getNode: (el): Node => ({
        type: nodeType,
        children: [{ text: '' }],
        data: {
          target: {
            sys: {
              id: el.getAttribute('data-entity-id'),
              type: 'Link',
              linkType: el.getAttribute('data-entity-type'),
            },
          },
        },
      }),
    },
  };
}
