import { BLOCKS, TEXT_CONTAINERS } from '@contentful/rich-text-types';
import { getEditorString } from '@udecode/plate-core';
import { Editor, Element, Path, Transforms } from 'slate';
import { RichTextEditor } from 'types';

import { focus, insertEmptyParagraph, moveToTheNextChar } from '../../helpers/editor';
import newEntitySelectorConfigFromRichTextField from '../../helpers/newEntitySelectorConfigFromRichTextField';
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

  Transforms.select(editor, selection);
  insertBlock(editor, nodeType, entity);
  ensureFollowingParagraph(editor);
  logAction('insert', { nodeType });
}

function ensureFollowingParagraph(editor: RichTextEditor) {
  /* 
     If the new block isn't followed by a sibling paragraph we insert a new empty one
   */
  // TODO check this

  // @ts-ignore
  const next = Editor.next(editor);
  if (!next) {
    return insertEmptyParagraph(editor);
  }

  // TODO check this

  // @ts-ignore
  const parent = Editor.above(editor, {
    voids: false,
    match: (e) =>
      !Element.isElement(e) ||
      ![BLOCKS.EMBEDDED_ASSET, BLOCKS.EMBEDDED_ENTRY].includes(e.type as BLOCKS),
  });

  if (Editor.isEditor(parent)) {
    // at level 0, a following paragraph is handled by the tralingParagraph plugin
    moveToTheNextChar(editor);
    return;
  }

  // TODO check this

  // @ts-ignore
  const paragraph = Editor.above(editor, {
    at: next[1],
    match: (e) => Element.isElement(e) && TEXT_CONTAINERS.includes(e.type as BLOCKS),
  });

  if (!paragraph || !parent || !Path.isChild(paragraph[1], parent[1])) {
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
export function insertBlock(editor, nodeType, entity) {
  if (!editor?.selection) return;

  const linkedEntityBlock = createNode(nodeType, entity);

  const hasText = editor.selection && !!getEditorString(editor, editor.selection.focus.path);

  if (hasText) {
    Transforms.insertNodes(editor, linkedEntityBlock);
  } else {
    Transforms.setNodes(editor, linkedEntityBlock);
  }

  focus(editor);
}
