import { BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';
import isHotkey from 'is-hotkey';
import { newEntitySelectorConfigFromRichTextField, newResourceEntitySelectorConfigFromRichTextField } from '../../helpers/config';
import { focus, getNodeEntryFromSelection, insertEmptyParagraph, moveToTheNextChar } from '../../helpers/editor';
import { watchCurrentSlide } from '../../helpers/sdkNavigatorSlideIn';
import { getText, getAboveNode, getLastNodeByLevel, insertNodes, setNodes, select, removeNodes } from '../../internal';
export function getWithEmbeddedBlockEvents(nodeType, sdk) {
    return (editor, { options: { hotkey } })=>(event)=>{
            const [, pathToSelectedElement] = getNodeEntryFromSelection(editor, nodeType);
            if (pathToSelectedElement) {
                const isDelete = event.key === 'Delete';
                const isBackspace = event.key === 'Backspace';
                if (isDelete || isBackspace) {
                    event.preventDefault();
                    removeNodes(editor, {
                        at: pathToSelectedElement
                    });
                }
                return;
            }
            if (hotkey && isHotkey(hotkey, event)) {
                if (nodeType === BLOCKS.EMBEDDED_RESOURCE) {
                    selectResourceEntityAndInsert(sdk, editor, editor.tracking.onShortcutAction);
                } else {
                    selectEntityAndInsert(nodeType, sdk, editor, editor.tracking.onShortcutAction);
                }
            }
        };
}
export async function selectEntityAndInsert(nodeType, sdk, editor, logAction) {
    logAction('openCreateEmbedDialog', {
        nodeType
    });
    const { field, dialogs } = sdk;
    const baseConfig = newEntitySelectorConfigFromRichTextField(field, nodeType);
    const selectEntity = baseConfig.entityType === 'Asset' ? dialogs.selectSingleAsset : dialogs.selectSingleEntry;
    const config = {
        ...baseConfig,
        withCreate: true
    };
    const { selection } = editor;
    const rteSlide = watchCurrentSlide(sdk.navigator);
    const entity = await selectEntity(config);
    if (!entity) {
        logAction('cancelCreateEmbedDialog', {
            nodeType
        });
    } else {
        select(editor, selection);
        insertBlock(editor, nodeType, entity);
        ensureFollowingParagraph(editor, [
            BLOCKS.EMBEDDED_ASSET,
            BLOCKS.EMBEDDED_ENTRY
        ]);
        logAction('insert', {
            nodeType,
            entity
        });
    }
    rteSlide.onActive(()=>{
        rteSlide.unwatch();
        focus(editor);
    });
}
export async function selectResourceEntityAndInsert(sdk, editor, logAction) {
    logAction('openCreateEmbedDialog', {
        nodeType: BLOCKS.EMBEDDED_RESOURCE
    });
    const { field, dialogs } = sdk;
    const config = newResourceEntitySelectorConfigFromRichTextField(field, BLOCKS.EMBEDDED_RESOURCE);
    const { selection } = editor;
    const entityLink = await dialogs.selectSingleResourceEntity(config);
    if (!entityLink) {
        logAction('cancelCreateEmbedDialog', {
            nodeType: BLOCKS.EMBEDDED_RESOURCE
        });
    } else {
        select(editor, selection);
        insertBlock(editor, BLOCKS.EMBEDDED_RESOURCE, entityLink);
        ensureFollowingParagraph(editor, [
            BLOCKS.EMBEDDED_RESOURCE
        ]);
        logAction('insert', {
            nodeType: BLOCKS.EMBEDDED_RESOURCE
        });
    }
}
function ensureFollowingParagraph(editor, nodeTypes) {
    const entityBlock = getAboveNode(editor, {
        match: {
            type: nodeTypes
        }
    });
    if (!entityBlock) {
        return;
    }
    const level = entityBlock[1].length - 1;
    const lastNode = getLastNodeByLevel(editor, level);
    const isTextContainer = TEXT_CONTAINERS.includes(lastNode?.[0].type ?? '');
    if (level !== 0 && !isTextContainer) {
        insertEmptyParagraph(editor);
    }
    moveToTheNextChar(editor);
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
            target: nodeType === BLOCKS.EMBEDDED_RESOURCE ? entity : getLink(entity)
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
    const hasText = editor.selection && !!getText(editor, editor.selection.focus.path);
    if (hasText) {
        insertNodes(editor, linkedEntityBlock);
    } else {
        setNodes(editor, linkedEntityBlock);
    }
}
