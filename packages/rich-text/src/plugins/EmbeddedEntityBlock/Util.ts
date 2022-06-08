import { BLOCKS } from '@contentful/rich-text-types';
import { getText } from '@udecode/plate-common';
import { Transforms } from 'slate';
import * as Slate from 'slate-react';
import newEntitySelectorConfigFromRichTextField from '../../helpers/newEntitySelectorConfigFromRichTextField';

export async function selectEntityAndInsert(nodeType, sdk, editor, logAction) {
  logAction('openCreateEmbedDialog', { nodeType });

  const { field, dialogs } = sdk;
  const baseConfig = newEntitySelectorConfigFromRichTextField(field, nodeType);
  const selectEntity =
    baseConfig.entityType === 'Asset' ? dialogs.selectSingleAsset : dialogs.selectSingleEntry;
  const config = { ...baseConfig, withCreate: true };
  try {
    const { selection } = editor;
    const entity = await selectEntity(config);
    if (!entity) {
      return;
    }
    Transforms.select(editor, selection);
    insertBlock(editor, nodeType, entity);
    logAction('insert', { nodeType });
  } catch (error) {
    if (error) {
      throw error;
    } else {
      logAction('cancelCreateEmbedDialog', { nodeType });
    }
  }
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
  const paragraph = {
    type: BLOCKS.PARAGRAPH,
    data: {},
    children: [{ text: '' }],
  };

  const hasText = editor.selection && !!getText(editor, editor.selection.focus.path);

  if (hasText) {
    Transforms.insertNodes(editor, linkedEntityBlock);
  } else {
    Transforms.setNodes(editor, linkedEntityBlock);
  }

  Transforms.insertNodes(editor, paragraph);

  Slate.ReactEditor.focus(editor);
}
