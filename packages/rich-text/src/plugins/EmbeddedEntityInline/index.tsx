import { FieldAppSDK } from '@contentful/app-sdk';
import { INLINES } from '@contentful/rich-text-types';

import { PlatePlugin, Node } from '../../internal/types';
import {
  createInlineEntryNode,
  getWithEmbeddedEntryInlineEvents,
} from '../shared/EmbeddedInlineUtil';
import { LinkedEntityInline } from './LinkedEntityInline';

export function createEmbeddedEntityInlinePlugin(sdk: FieldAppSDK): PlatePlugin {
  const htmlAttributeName = 'data-embedded-entity-inline-id';

  return {
    key: INLINES.EMBEDDED_ENTRY,
    type: INLINES.EMBEDDED_ENTRY,
    isElement: true,
    isInline: true,
    isVoid: true,
    component: LinkedEntityInline,
    options: {
      hotkey: 'mod+shift+2',
    },
    handlers: {
      onKeyDown: getWithEmbeddedEntryInlineEvents(sdk),
    },
    deserializeHtml: {
      rules: [
        {
          validAttribute: htmlAttributeName,
        },
      ],
      withoutChildren: true,
      getNode: (el): Node => createInlineEntryNode(el.getAttribute(htmlAttributeName) as string),
    },
  };
}
