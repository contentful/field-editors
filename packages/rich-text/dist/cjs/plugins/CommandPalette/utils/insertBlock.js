"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "insertBlock", {
    enumerable: true,
    get: function() {
        return insertBlock;
    }
});
const _editor = require("../../../helpers/editor");
const _queries = require("../../../internal/queries");
const _transforms = require("../../../internal/transforms");
const createNode = (nodeType, entity)=>({
        type: nodeType,
        data: {
            target: {
                sys: {
                    id: entity.sys.id,
                    type: 'Link',
                    linkType: entity.sys.type
                }
            }
        },
        children: [
            {
                text: ''
            }
        ],
        isVoid: true
    });
function insertBlock(editor, nodeType, entity) {
    if (!editor?.selection) return;
    const linkedEntityBlock = createNode(nodeType, entity);
    const hasText = editor.selection && !!(0, _queries.getText)(editor, editor.selection.focus.path);
    if (hasText) {
        (0, _transforms.insertNodes)(editor, linkedEntityBlock);
    } else {
        (0, _transforms.setNodes)(editor, linkedEntityBlock);
    }
    (0, _editor.focus)(editor);
}
