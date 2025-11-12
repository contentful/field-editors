import { BLOCKS, CONTAINERS } from '@contentful/rich-text-types';
import { transformLift, transformUnwrap } from '../../helpers/transformers';
import { Quote } from './components/Quote';
import { shouldResetQuoteOnBackspace } from './shouldResetQuote';
import { onKeyDownToggleQuote, toggleQuote } from './toggleQuote';
import { withQuote } from './withQuote';
export function createQuotePlugin() {
    return {
        key: BLOCKS.QUOTE,
        type: BLOCKS.QUOTE,
        isElement: true,
        component: Quote,
        options: {
            hotkey: 'mod+shift+1'
        },
        handlers: {
            onKeyDown: onKeyDownToggleQuote
        },
        deserializeHtml: {
            rules: [
                {
                    validNodeName: 'BLOCKQUOTE'
                }
            ]
        },
        resetNode: [
            {
                hotkey: 'backspace',
                types: [
                    BLOCKS.QUOTE
                ],
                predicate: shouldResetQuoteOnBackspace,
                onReset: toggleQuote
            }
        ],
        normalizer: [
            {
                validChildren: CONTAINERS[BLOCKS.QUOTE],
                transform: {
                    [BLOCKS.QUOTE]: transformUnwrap,
                    default: transformLift
                }
            }
        ],
        withOverrides: withQuote
    };
}
