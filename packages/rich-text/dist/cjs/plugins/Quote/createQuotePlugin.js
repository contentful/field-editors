"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createQuotePlugin", {
    enumerable: true,
    get: function() {
        return createQuotePlugin;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _transformers = require("../../helpers/transformers");
const _Quote = require("./components/Quote");
const _shouldResetQuote = require("./shouldResetQuote");
const _toggleQuote = require("./toggleQuote");
const _withQuote = require("./withQuote");
function createQuotePlugin() {
    return {
        key: _richtexttypes.BLOCKS.QUOTE,
        type: _richtexttypes.BLOCKS.QUOTE,
        isElement: true,
        component: _Quote.Quote,
        options: {
            hotkey: 'mod+shift+1'
        },
        handlers: {
            onKeyDown: _toggleQuote.onKeyDownToggleQuote
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
                    _richtexttypes.BLOCKS.QUOTE
                ],
                predicate: _shouldResetQuote.shouldResetQuoteOnBackspace,
                onReset: _toggleQuote.toggleQuote
            }
        ],
        normalizer: [
            {
                validChildren: _richtexttypes.CONTAINERS[_richtexttypes.BLOCKS.QUOTE],
                transform: {
                    [_richtexttypes.BLOCKS.QUOTE]: _transformers.transformUnwrap,
                    default: _transformers.transformLift
                }
            }
        ],
        withOverrides: _withQuote.withQuote
    };
}
