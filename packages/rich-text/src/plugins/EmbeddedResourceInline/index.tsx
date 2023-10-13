import { FieldAppSDK } from '@contentful/app-sdk';
import { INLINES } from '@contentful/rich-text-types';

import { PlatePlugin } from '../../internal';
import { getWithEmbeddedEntryInlineEvents } from '../shared/EmbeddedInlineUtil';
import { LinkedResourceInline } from './LinkedResourceInline';

export function createEmbeddedResourceInlinePlugin(sdk: FieldAppSDK): PlatePlugin {
  const htmlAttributeName = 'data-embedded-resource-inline-id';

  return {
    key: INLINES.EMBEDDED_RESOURCE,
    type: INLINES.EMBEDDED_RESOURCE,
    isElement: true,
    isInline: true,
    isVoid: true,
    component: LinkedResourceInline,
    options: {
      hotkey: 'mod+shift+p',
    },
    handlers: {
      onKeyDown: getWithEmbeddedEntryInlineEvents(INLINES.EMBEDDED_RESOURCE, sdk),
    },
    deserializeHtml: {
      rules: [
        {
          validAttribute: htmlAttributeName,
        },
      ],
      withoutChildren: true,
      getNode: (el) => ({
        type: INLINES.EMBEDDED_RESOURCE,
        children: [{ text: '' }],
        data: {
          target: {
            sys: {
              urn: el.getAttribute('data-entity-id'),
              linkType: el.getAttribute('data-entity-type'),
              type: 'ResourceLink',
            },
          },
        },
      }),
    },
  };
}
