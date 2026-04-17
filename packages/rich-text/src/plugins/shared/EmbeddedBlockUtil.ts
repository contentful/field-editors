import { FieldAppSDK } from '@contentful/app-sdk';
import { BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';
import { HotkeyPlugin } from '@udecode/plate-common';
import isHotkey from 'is-hotkey';

import {
  newEntitySelectorConfigFromRichTextField,
  newResourceEntitySelectorConfigFromRichTextField,
} from '../../helpers/config';
import {
  focus,
  getAncestorPathFromSelection,
  getNodeEntryFromSelection,
  insertEmptyParagraph,
  moveToTheNextChar,
} from '../../helpers/editor';
import { watchCurrentSlide } from '../../helpers/sdkNavigatorSlideIn';
import {
  getAboveNode,
  getLastNodeByLevel,
  insertNodes,
  getSelectionElementPath,
  isEmptyTextContainer,
  PlateEditor,
  setNodes,
  KeyboardHandler,
  removeNodes,
  moveNodes,
  isFirstChildPath,
  getPreviousPath,
  getNodeEntries,
  isAncestorEmpty,
  Ancestor,
} from '../../internal';
import { TrackingPluginActions } from '../Tracking';

export function getWithEmbeddedBlockEvents(
  nodeType: BLOCKS.EMBEDDED_ENTRY | BLOCKS.EMBEDDED_ASSET | BLOCKS.EMBEDDED_RESOURCE,
  sdk: FieldAppSDK,
): KeyboardHandler<HotkeyPlugin> {
  return (editor, { options: { hotkey } }) =>
    (event) => {
      const [, pathToSelectedElement] = getNodeEntryFromSelection(editor, nodeType);

      if (pathToSelectedElement) {
        const isDelete = event.key === 'Delete';
        const isBackspace = event.key === 'Backspace';

        if (isDelete || isBackspace) {
          event.preventDefault();
          removeNodes(editor, { at: pathToSelectedElement });
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

export async function selectEntityAndInsert(
  nodeType,
  sdk,
  editor,
  logAction: TrackingPluginActions['onToolbarAction'] | TrackingPluginActions['onShortcutAction'],
) {
  logAction('openCreateEmbedDialog', { nodeType });

  const { field, dialogs } = sdk;
  const baseConfig = newEntitySelectorConfigFromRichTextField(field, nodeType);
  const selectEntity =
    baseConfig.entityType === 'Asset' ? dialogs.selectSingleAsset : dialogs.selectSingleEntry;
  const config = { ...baseConfig, withCreate: true };

  const rteSlide = watchCurrentSlide(sdk.navigator);
  const entity = await selectEntity(config);

  if (!entity) {
    logAction('cancelCreateEmbedDialog', { nodeType });
  } else {
    insertBlock(editor, nodeType, entity);
    ensureFollowingParagraph(editor, [BLOCKS.EMBEDDED_ASSET, BLOCKS.EMBEDDED_ENTRY]);
    logAction('insert', { nodeType, entity });
  }
  // If user chose to create a new entity, this might open slide-in to edit the
  // entity. In this case, no point in focusing RTE which is now in the slide below.
  rteSlide.onActive(() => {
    rteSlide.unwatch();
    focus(editor);
  });
}

export async function selectResourceEntityAndInsert(
  sdk,
  editor,
  logAction: TrackingPluginActions['onToolbarAction'] | TrackingPluginActions['onShortcutAction'],
) {
  logAction('openCreateEmbedDialog', { nodeType: BLOCKS.EMBEDDED_RESOURCE });

  const { field, dialogs } = sdk;
  const config = newResourceEntitySelectorConfigFromRichTextField(field, BLOCKS.EMBEDDED_RESOURCE);

  const entityLink = await dialogs.selectSingleResourceEntity(config);

  if (!entityLink) {
    logAction('cancelCreateEmbedDialog', { nodeType: BLOCKS.EMBEDDED_RESOURCE });
  } else {
    insertBlock(editor, BLOCKS.EMBEDDED_RESOURCE, entityLink);
    ensureFollowingParagraph(editor, [BLOCKS.EMBEDDED_RESOURCE]);
    logAction('insert', { nodeType: BLOCKS.EMBEDDED_RESOURCE });
  }
}

// TODO: incorporate this logic inside the trailingParagraph plugin instead
function ensureFollowingParagraph(editor: PlateEditor, nodeTypes: BLOCKS[]) {
  const entityBlock = getAboveNode(editor, {
    match: {
      type: nodeTypes,
    },
  });

  if (!entityBlock) {
    return;
  }

  const level = entityBlock[1].length - 1;
  const lastNode = getLastNodeByLevel(editor, level);

  const isTextContainer = (TEXT_CONTAINERS as string[]).includes(
    (lastNode?.[0].type ?? '') as string,
  );

  // If the new block isn't followed by a sibling text container (e.g. paragraph)
  // we insert a new empty one. Level 0 is handled by the trailingParagraph plugin
  if (level !== 0 && !isTextContainer) {
    insertEmptyParagraph(editor);
  }

  moveToTheNextChar(editor);
}

const getLink = (entity) => {
  return {
    sys: {
      id: entity.sys.id,
      type: 'Link',
      linkType: entity.sys.type,
    },
  };
};

const createNode = (nodeType, entity) => {
  return {
    type: nodeType,
    data: {
      target: nodeType === BLOCKS.EMBEDDED_RESOURCE ? entity : getLink(entity),
    },
    children: [{ text: '' }],
    isVoid: true,
  };
};

// TODO: DRY up copied code from HR
function insertBlock(editor: PlateEditor, nodeType: string, entity) {
  const linkedEntityBlock = createNode(nodeType, entity);

  const elementPath = getSelectionElementPath(editor);
  if (elementPath && isEmptyTextContainer(editor, elementPath)) {
    setNodes(editor, linkedEntityBlock, { at: elementPath });
    return;
  }

  insertNodes(editor, linkedEntityBlock);
  replaceEmptyParagraphWithBlock(editor);
}

export function replaceEmptyParagraphWithBlock(editor: PlateEditor) {
  const blockPath = getAncestorPathFromSelection(editor);
  if (!blockPath || isFirstChildPath(blockPath)) return;

  const previousPath = getPreviousPath(blockPath);
  if (!previousPath) return;

  const [nodes] = getNodeEntries(editor, {
    at: previousPath,
    match: (node) => node.type === BLOCKS.PARAGRAPH,
  });
  if (!nodes) return;

  const [previousNode] = nodes;
  const isPreviousNodeTextEmpty = isAncestorEmpty(editor, previousNode as Ancestor);
  if (isPreviousNodeTextEmpty) {
    // Switch block with previous empty paragraph
    moveNodes(editor, { at: blockPath, to: previousPath });
    // Remove previous paragraph that now is under the block
    removeNodes(editor, { at: blockPath });
  }
}
