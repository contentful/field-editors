"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "withQuote", {
    enumerable: true,
    get: function() {
        return withQuote;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _slate = require("slate");
const _queries = require("../../internal/queries");
const _transforms = require("../../internal/transforms");
const withQuote = (editor)=>{
    const { insertFragment } = editor;
    editor.insertFragment = (fragment)=>{
        const startingNode = fragment.length && fragment[0];
        const startsWithBlockquote = _slate.Element.isElement(startingNode) && startingNode.type === _richtexttypes.BLOCKS.QUOTE;
        const containerEntry = (0, _queries.getAboveNode)(editor, {
            match: {
                type: _richtexttypes.TEXT_CONTAINERS
            }
        });
        const containerIsNotEmpty = containerEntry && (0, _queries.getText)(editor, containerEntry[1]) !== '';
        if (startsWithBlockquote && containerIsNotEmpty) {
            const { selection } = editor;
            const isContentSelected = (selection)=>!!selection && _slate.Point.compare(selection.anchor, selection.focus) !== 0;
            if (isContentSelected(selection)) {
                (0, _transforms.deleteText)(editor, {
                    at: selection
                });
            }
            const containerEntry = (0, _queries.getAboveNode)(editor, {
                match: {
                    type: _richtexttypes.TEXT_CONTAINERS
                }
            });
            const containerIsNotEmpty = containerEntry && (0, _queries.getText)(editor, containerEntry[1]) !== '';
            if (containerIsNotEmpty) {
                (0, _transforms.insertNodes)(editor, fragment);
                return;
            }
        }
        insertFragment(fragment);
    };
    return editor;
};
