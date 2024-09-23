import { BLOCKS, CONTAINERS } from '@contentful/rich-text-types';

import { transformLift, transformUnwrap } from '../../helpers/transformers';
import { PlatePlugin } from '../../internal/types';
import { Quote } from './components/Quote';
import { shouldResetQuoteOnBackspace } from './shouldResetQuote';
import { onKeyDownToggleQuote, toggleQuote } from './toggleQuote';
import { withQuote } from './withQuote';

export function createQuotePlugin(): PlatePlugin {
  return {
    key: BLOCKS.QUOTE,
    type: BLOCKS.QUOTE,
    isElement: true,
    component: Quote,
    options: {
      hotkey: 'mod+shift+1',
    },
    handlers: {
      onKeyDown: onKeyDownToggleQuote,
    },
    deserializeHtml: {
      rules: [
        {
          validNodeName: 'BLOCKQUOTE',
        },
      ],
    },
    resetNode: [
      {
        // toggle off blockquote on backspace when it's empty
        hotkey: 'backspace',
        types: [BLOCKS.QUOTE],
        predicate: shouldResetQuoteOnBackspace,
        onReset: toggleQuote,
      },
    ],
    normalizer: [
      {
        validChildren: CONTAINERS[BLOCKS.QUOTE],
        transform: {
          [BLOCKS.QUOTE]: transformUnwrap,
          default: transformLift,
        },
      },
    ],
    withOverrides: withQuote,
  };
}
