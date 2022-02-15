import { BLOCKS, CONTAINERS } from '@contentful/rich-text-types';

import { transformLift, transformUnwrap } from '../../helpers/transformers';
import { TrackingProvider } from '../../TrackingProvider';
import { RichTextPlugin } from '../../types';
import { Quote } from './components/Quote';
import { onKeyDownToggleQuote } from './toggleQuote';

export function createQuotePlugin(tracking: TrackingProvider): RichTextPlugin {
  return {
    key: BLOCKS.QUOTE,
    type: BLOCKS.QUOTE,
    isElement: true,
    component: Quote,
    options: {
      hotkey: 'mod+shift+1',
    },
    handlers: {
      onKeyDown: onKeyDownToggleQuote(tracking),
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
        transform: {
          [BLOCKS.QUOTE]: transformUnwrap,
          [BLOCKS.HEADING_1]: transformUnwrap,
          [BLOCKS.HEADING_2]: transformUnwrap,
          [BLOCKS.HEADING_3]: transformUnwrap,
          [BLOCKS.HEADING_4]: transformUnwrap,
          [BLOCKS.HEADING_5]: transformUnwrap,
          [BLOCKS.HEADING_6]: transformUnwrap,
          default: transformLift,
        },
      },
    ],
  };
}
