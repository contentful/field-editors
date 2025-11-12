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
    getWithEmbeddedEntryInlineEvents: function() {
        return getWithEmbeddedEntryInlineEvents;
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
const _transforms = require("../../internal/transforms");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function getWithEmbeddedEntryInlineEvents(nodeType, sdk) {
    return function withEmbeddedEntryInlineEvents(editor, { options: { hotkey } }) {
        return function handleEvent(event) {
            if (!editor) return;
            if (hotkey && (0, _ishotkey.default)(hotkey, event)) {
                if (nodeType === _richtexttypes.INLINES.EMBEDDED_RESOURCE) {
                    selectResourceEntityAndInsert(editor, sdk, editor.tracking.onShortcutAction);
                } else {
                    selectEntityAndInsert(editor, sdk, editor.tracking.onShortcutAction);
                }
            }
        };
    };
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
const createInlineEntryNode = (nodeType, entity)=>{
    return {
        type: nodeType,
        children: [
            {
                text: ''
            }
        ],
        data: {
            target: nodeType === _richtexttypes.INLINES.EMBEDDED_RESOURCE ? entity : getLink(entity)
        }
    };
};
async function selectEntityAndInsert(editor, sdk, logAction) {
    const nodeType = _richtexttypes.INLINES.EMBEDDED_ENTRY;
    logAction('openCreateEmbedDialog', {
        nodeType
    });
    const config = {
        ...(0, _config.newEntitySelectorConfigFromRichTextField)(sdk.field, nodeType),
        withCreate: true
    };
    const { selection } = editor;
    const rteSlide = (0, _sdkNavigatorSlideIn.watchCurrentSlide)(sdk.navigator);
    const entry = await sdk.dialogs.selectSingleEntry(config);
    if (!entry) {
        logAction('cancelCreateEmbedDialog', {
            nodeType
        });
    } else {
        (0, _transforms.select)(editor, selection);
        (0, _transforms.insertNodes)(editor, createInlineEntryNode(nodeType, entry));
        logAction('insert', {
            nodeType,
            entity: entry
        });
    }
    rteSlide.onActive(()=>{
        rteSlide.unwatch();
        (0, _editor.focus)(editor);
    });
}
async function selectResourceEntityAndInsert(editor, sdk, logAction) {
    const nodeType = _richtexttypes.INLINES.EMBEDDED_RESOURCE;
    logAction('openCreateEmbedDialog', {
        nodeType
    });
    const { dialogs, field } = sdk;
    const config = {
        ...(0, _config.newResourceEntitySelectorConfigFromRichTextField)(field, nodeType),
        withCreate: true
    };
    const { selection } = editor;
    const entryLink = await dialogs.selectSingleResourceEntity(config);
    if (!entryLink) {
        logAction('cancelCreateEmbedDialog', {
            nodeType
        });
    } else {
        (0, _transforms.select)(editor, selection);
        (0, _transforms.insertNodes)(editor, createInlineEntryNode(nodeType, entryLink));
        logAction('insert', {
            nodeType
        });
    }
}
