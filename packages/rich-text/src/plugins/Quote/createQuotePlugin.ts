import { BLOCKS, CONTAINERS } from '@contentful/rich-text-types';
import { onKeyDownToggleElement } from '@udecode/plate-core';
import { transformLift } from '../../helpers/transformers';
import { RichTextPlugin } from '../../types';
import { Quote } from './components/Quote';

export function createQuotePlugin(): RichTextPlugin {
  return {
    key: BLOCKS.QUOTE,
    type: BLOCKS.QUOTE,
    isElement: true,
    component: Quote,
    options: {
      hotkey: 'mod+shift+1',
    },
    handlers: {
      onKeyDown: onKeyDownToggleElement,
    },
    deserializeHtml: {
      rules: [
        {
          validNodeName: 'BLOCKQUOTE',
        },
      ],
    },
    normalizer: [
      {
        validChildren: CONTAINERS[BLOCKS.QUOTE],
        transform: transformLift,
      },
    ],
  };
}
