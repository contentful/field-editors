import { INLINES } from '@contentful/rich-text-types';
import isHotkey from 'is-hotkey';
import { newEntitySelectorConfigFromRichTextField, newResourceEntitySelectorConfigFromRichTextField } from '../../helpers/config';
import { focus } from '../../helpers/editor';
import { watchCurrentSlide } from '../../helpers/sdkNavigatorSlideIn';
import { insertNodes, select } from '../../internal/transforms';
export function getWithEmbeddedEntryInlineEvents(nodeType, sdk) {
    return function withEmbeddedEntryInlineEvents(editor, { options: { hotkey } }) {
        return function handleEvent(event) {
            if (!editor) return;
            if (hotkey && isHotkey(hotkey, event)) {
                if (nodeType === INLINES.EMBEDDED_RESOURCE) {
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
            target: nodeType === INLINES.EMBEDDED_RESOURCE ? entity : getLink(entity)
        }
    };
};
export async function selectEntityAndInsert(editor, sdk, logAction) {
    const nodeType = INLINES.EMBEDDED_ENTRY;
    logAction('openCreateEmbedDialog', {
        nodeType
    });
    const config = {
        ...newEntitySelectorConfigFromRichTextField(sdk.field, nodeType),
        withCreate: true
    };
    const { selection } = editor;
    const rteSlide = watchCurrentSlide(sdk.navigator);
    const entry = await sdk.dialogs.selectSingleEntry(config);
    if (!entry) {
        logAction('cancelCreateEmbedDialog', {
            nodeType
        });
    } else {
        select(editor, selection);
        insertNodes(editor, createInlineEntryNode(nodeType, entry));
        logAction('insert', {
            nodeType,
            entity: entry
        });
    }
    rteSlide.onActive(()=>{
        rteSlide.unwatch();
        focus(editor);
    });
}
export async function selectResourceEntityAndInsert(editor, sdk, logAction) {
    const nodeType = INLINES.EMBEDDED_RESOURCE;
    logAction('openCreateEmbedDialog', {
        nodeType
    });
    const { dialogs, field } = sdk;
    const config = {
        ...newResourceEntitySelectorConfigFromRichTextField(field, nodeType),
        withCreate: true
    };
    const { selection } = editor;
    const entryLink = await dialogs.selectSingleResourceEntity(config);
    if (!entryLink) {
        logAction('cancelCreateEmbedDialog', {
            nodeType
        });
    } else {
        select(editor, selection);
        insertNodes(editor, createInlineEntryNode(nodeType, entryLink));
        logAction('insert', {
            nodeType
        });
    }
}
