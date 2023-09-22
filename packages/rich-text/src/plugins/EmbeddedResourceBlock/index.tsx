import { FieldAppSDK } from '@contentful/app-sdk';
import { BLOCKS } from '@contentful/rich-text-types';

import { PlatePlugin } from '../../internal';
import { getWithEmbeddedBlockEvents } from '../shared/EmbeddedBlockUtil';
import { LinkedResourceBlock } from './LinkedResourceBlock';

const createEmbeddedResourcePlugin =
  (nodeType: BLOCKS.EMBEDDED_RESOURCE, hotkey: string) =>
  (sdk: FieldAppSDK): PlatePlugin => ({
    key: nodeType,
    type: nodeType,
    isElement: true,
    isVoid: true,
    component: LinkedResourceBlock,
    options: { hotkey },
    handlers: {
      onKeyDown: getWithEmbeddedBlockEvents(nodeType, sdk),
    },
    deserializeHtml: {
      rules: [
        {
          validAttribute: {
            'data-entity-type': 'Contentful:Entry',
          },
        },
      ],
      withoutChildren: true,
      getNode: (el) => ({
        type: nodeType,
        children: [{ text: '' }],
        isVoid: true,
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
  });

export const createEmbeddedResourceBlockPlugin = createEmbeddedResourcePlugin(
  BLOCKS.EMBEDDED_RESOURCE,
  'mod+shift+s'
);
