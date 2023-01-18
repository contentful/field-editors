import { BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';

import { focus, insertEmptyParagraph, moveToTheNextChar } from '../../helpers/editor';
import newEntitySelectorConfigFromRichTextField from '../../helpers/newEntitySelectorConfigFromRichTextField';
import { getText, getAboveNode, getLastNodeByLevel } from '../../internal/queries';
import { select, insertNodes, setNodes } from '../../internal/transforms';
import { PlateEditor } from '../../internal/types';
import { TrackingPluginActions } from '../../plugins/Tracking';

export async function selectEntityAndInsert(
  nodeType,
  sdk,
  editor,
  logAction: TrackingPluginActions['onToolbarAction'] | TrackingPluginActions['onShortcutAction']
) {
  logAction('openCreateEmbedDialog', { nodeType });

  const { field, dialogs } = sdk;
  const baseConfig = newEntitySelectorConfigFromRichTextField(field, nodeType);
  const selectEntity =
    baseConfig.entityType === 'Asset' ? dialogs.selectSingleAsset : dialogs.selectSingleEntry;
  const config = { ...baseConfig, withCreate: true };

  const { selection } = editor;
  const entity = await selectEntity(config);
  if (!entity) {
    logAction('cancelCreateEmbedDialog', { nodeType });
    return;
  }

  select(editor, selection);

  insertBlock(editor, nodeType, entity);
  ensureFollowingParagraph(editor);

  logAction('insert', { nodeType });
}

// TODO: incorporate this logic inside the trailingParagraph plugin instead
function ensureFollowingParagraph(editor: PlateEditor) {
  const entityBlock = getAboveNode(editor, {
    match: {
      type: [BLOCKS.EMBEDDED_ASSET, BLOCKS.EMBEDDED_ENTRY],
    },
  });

  if (!entityBlock) {
    return;
  }

  const level = entityBlock[1].length - 1;
  const lastNode = getLastNodeByLevel(editor, level);

  const isTextContainer = (TEXT_CONTAINERS as string[]).includes(
    (lastNode?.[0].type ?? '') as string
  );

  // If the new block isn't followed by a sibling text container (e.g. paragraph)
  // we insert a new empty one. Level 0 is handled by the trailingParagraph plugin
  if (level !== 0 && !isTextContainer) {
    insertEmptyParagraph(editor);
  }

  moveToTheNextChar(editor);
}

const createNode = (nodeType, entity) => ({
  type: nodeType,
  data: {
    target: {
      sys: {
        id: entity.sys.id,
        type: 'Link',
        linkType: entity.sys.type,
      },
    },
  },
  children: [{ text: '' }],
  isVoid: true,
});

// TODO: DRY up copied code from HR
export function insertBlock(editor: PlateEditor, nodeType: string, entity) {
  if (!editor?.selection) return;

  const linkedEntityBlock = createNode(nodeType, entity);

  const hasText = editor.selection && !!getText(editor, editor.selection.focus.path);

  if (hasText) {
    insertNodes(editor, linkedEntityBlock);
  } else {
    setNodes(editor, linkedEntityBlock);
  }

  focus(editor);
}
