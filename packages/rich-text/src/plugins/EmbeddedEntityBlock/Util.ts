import { BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';

import { focus, insertEmptyParagraph, moveToTheNextChar } from '../../helpers/editor';
import newEntitySelectorConfigFromRichTextField from '../../helpers/newEntitySelectorConfigFromRichTextField';
import {
  getText,
  getAboveNode,
  isEditor,
  getNextNode,
  isElement,
  isChildPath,
} from '../../internal/queries';
import { setSelection, insertNodes, setNodes } from '../../internal/transforms';
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

  setSelection(editor, selection);
  insertBlock(editor, nodeType, entity);
  ensureFollowingParagraph(editor);
  logAction('insert', { nodeType });
}

function ensureFollowingParagraph(editor: PlateEditor) {
  /* 
     If the new block isn't followed by a sibling paragraph we insert a new empty one
   */
  const next = getNextNode(editor);
  if (!next) {
    return insertEmptyParagraph(editor);
  }

  const parent = getAboveNode(editor, {
    voids: false,
    match: (e) =>
      !isElement(e) || ![BLOCKS.EMBEDDED_ASSET, BLOCKS.EMBEDDED_ENTRY].includes(e.type as BLOCKS),
  });

  if (isEditor(parent)) {
    // at level 0, a following paragraph is handled by the trailingParagraph plugin
    moveToTheNextChar(editor);
    return;
  }

  const paragraph = getAboveNode(editor, {
    at: next[1],
    match: (e) => isElement(e) && TEXT_CONTAINERS.includes(e.type as BLOCKS),
  });

  if (!paragraph || !parent || !isChildPath(paragraph[1], parent[1])) {
    return insertEmptyParagraph(editor);
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
