"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createInlineEntryNode", {
    enumerable: true,
    get: function() {
        return createInlineEntryNode;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
function createInlineEntryNode(id) {
    return {
        type: _richtexttypes.INLINES.EMBEDDED_ENTRY,
        children: [
            {
                text: ''
            }
        ],
        data: {
            target: {
                sys: {
                    id,
                    type: 'Link',
                    linkType: 'Entry'
                }
            }
        }
    };
}
