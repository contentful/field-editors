import { BLOCKS } from '@contentful/rich-text-types';
import { haveTextInSomeBlocks } from '../shared/UtilHave';
import newEntitySelectorConfigFromRichTextField from '../../helpers/newEntitySelectorConfigFromRichTextField';

/**
 * Returns whether given value has a block of the given type.
 * @param {slate.Editor} editor
 * @param {string} type
 * @returns {boolean}
 */
export const hasBlockOfType = (editor, type) => {
  const blocks = editor.value.blocks;
  return blocks.get(0).type === type;
};

/**
 * Invokes entity selector modal and inserts block embed.
 * @param {string} nodeType
 * @param {import('@contentful/field-editor-reference/dist/types').FieldExtensionSDK} sdk
 * @param {slate.Editor} editor
 * @param {function} logAction
 */
export async function selectEntityAndInsert(nodeType, sdk, editor, logAction) {
  logAction('openCreateEmbedDialog', { nodeType });

  const { field, dialogs } = sdk;
  const baseConfig = newEntitySelectorConfigFromRichTextField(field, nodeType);
  const selectEntity =
    baseConfig.entityType === 'Asset' ? dialogs.selectSingleAsset : dialogs.selectSingleEntry;
  const config = { ...baseConfig, withCreate: true };
  try {
    const entity = await selectEntity(config);
    if (!entity) {
      return;
    }
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

export const createNode = (nodeType, entity) => ({
  type: nodeType,
  object: 'block',
  data: {
    target: {
      sys: {
        id: entity.sys.id,
        type: 'Link',
        linkType: entity.sys.type,
      },
    },
  },
});

export function insertBlock(editor, nodeType, entity, focusNextLine = true) {
  const linkedEntityBlock = createNode(nodeType, entity);
  if (editor.value.blocks.size === 0 || haveTextInSomeBlocks(editor)) {
    editor.insertBlock(linkedEntityBlock);
  } else {
    editor.setBlocks(linkedEntityBlock);
  }

  if (focusNextLine) {
    editor.insertBlock(BLOCKS.PARAGRAPH).focus();
  }
}
