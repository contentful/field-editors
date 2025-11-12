"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getWithEmbeddedBlockEvents: function() {
        return getWithEmbeddedBlockEvents;
    },
    selectEntityAndInsert: function() {
        return selectEntityAndInsert;
    },
    selectResourceEntityAndInsert: function() {
        return selectResourceEntityAndInsert;
    }
});
const _richtexttypes = require("@contentful/rich-text-types");
const _ishotkey = /*#__PURE__*/ _interop_require_default(require("is-hotkey"));
const _config = require("../../helpers/config");
const _editor = require("../../helpers/editor");
const _sdkNavigatorSlideIn = require("../../helpers/sdkNavigatorSlideIn");
const _internal = require("../../internal");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function getWithEmbeddedBlockEvents(nodeType, sdk) {
    return (editor, { options: { hotkey } })=>(event)=>{
            const [, pathToSelectedElement] = (0, _editor.getNodeEntryFromSelection)(editor, nodeType);
            if (pathToSelectedElement) {
                const isDelete = event.key === 'Delete';
                const isBackspace = event.key === 'Backspace';
                if (isDelete || isBackspace) {
                    event.preventDefault();
                    (0, _internal.removeNodes)(editor, {
                        at: pathToSelectedElement
                    });
                }
                return;
            }
            if (hotkey && (0, _ishotkey.default)(hotkey, event)) {
                if (nodeType === _richtexttypes.BLOCKS.EMBEDDED_RESOURCE) {
                    selectResourceEntityAndInsert(sdk, editor, editor.tracking.onShortcutAction);
                } else {
                    selectEntityAndInsert(nodeType, sdk, editor, editor.tracking.onShortcutAction);
                }
            }
        };
}
async function selectEntityAndInsert(nodeType, sdk, editor, logAction) {
    logAction('openCreateEmbedDialog', {
        nodeType
    });
    const { field, dialogs } = sdk;
    const baseConfig = (0, _config.newEntitySelectorConfigFromRichTextField)(field, nodeType);
    const selectEntity = baseConfig.entityType === 'Asset' ? dialogs.selectSingleAsset : dialogs.selectSingleEntry;
    const config = {
        ...baseConfig,
        withCreate: true
    };
    const { selection } = editor;
    const rteSlide = (0, _sdkNavigatorSlideIn.watchCurrentSlide)(sdk.navigator);
    const entity = await selectEntity(config);
    if (!entity) {
        logAction('cancelCreateEmbedDialog', {
            nodeType
        });
    } else {
        (0, _internal.select)(editor, selection);
        insertBlock(editor, nodeType, entity);
        ensureFollowingParagraph(editor, [
            _richtexttypes.BLOCKS.EMBEDDED_ASSET,
            _richtexttypes.BLOCKS.EMBEDDED_ENTRY
        ]);
        logAction('insert', {
            nodeType,
            entity
        });
    }
    rteSlide.onActive(()=>{
        rteSlide.unwatch();
        (0, _editor.focus)(editor);
    });
}
async function selectResourceEntityAndInsert(sdk, editor, logAction) {
    logAction('openCreateEmbedDialog', {
        nodeType: _richtexttypes.BLOCKS.EMBEDDED_RESOURCE
    });
    const { field, dialogs } = sdk;
    const config = (0, _config.newResourceEntitySelectorConfigFromRichTextField)(field, _richtexttypes.BLOCKS.EMBEDDED_RESOURCE);
    const { selection } = editor;
    const entityLink = await dialogs.selectSingleResourceEntity(config);
    if (!entityLink) {
        logAction('cancelCreateEmbedDialog', {
            nodeType: _richtexttypes.BLOCKS.EMBEDDED_RESOURCE
        });
    } else {
        (0, _internal.select)(editor, selection);
        insertBlock(editor, _richtexttypes.BLOCKS.EMBEDDED_RESOURCE, entityLink);
        ensureFollowingParagraph(editor, [
            _richtexttypes.BLOCKS.EMBEDDED_RESOURCE
        ]);
        logAction('insert', {
            nodeType: _richtexttypes.BLOCKS.EMBEDDED_RESOURCE
        });
    }
}
function ensureFollowingParagraph(editor, nodeTypes) {
    const entityBlock = (0, _internal.getAboveNode)(editor, {
        match: {
            type: nodeTypes
        }
    });
    if (!entityBlock) {
        return;
    }
    const level = entityBlock[1].length - 1;
    const lastNode = (0, _internal.getLastNodeByLevel)(editor, level);
    const isTextContainer = _richtexttypes.TEXT_CONTAINERS.includes(lastNode?.[0].type ?? '');
    if (level !== 0 && !isTextContainer) {
        (0, _editor.insertEmptyParagraph)(editor);
    }
    (0, _editor.moveToTheNextChar)(editor);
}
const getLink = (entity)=>{
    return {
        sys: {
            id: entity.sys.id,
            type: 'Link',
            linkType: entity.sys.type
        }
    };
};
const createNode = (nodeType, entity)=>{
    return {
        type: nodeType,
        data: {
            target: nodeType === _richtexttypes.BLOCKS.EMBEDDED_RESOURCE ? entity : getLink(entity)
        },
        children: [
            {
                text: ''
            }
        ],
        isVoid: true
    };
};
function insertBlock(editor, nodeType, entity) {
    if (!editor?.selection) return;
    const linkedEntityBlock = createNode(nodeType, entity);
    const hasText = editor.selection && !!(0, _internal.getText)(editor, editor.selection.focus.path);
    if (hasText) {
        (0, _internal.insertNodes)(editor, linkedEntityBlock);
    } else {
        (0, _internal.setNodes)(editor, linkedEntityBlock);
    }
}
