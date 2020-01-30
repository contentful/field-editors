import { BLOCKS } from '@contentful/rich-text-types';
import { haveTextInSomeBlocks } from '../shared/UtilHave';
import { newConfigFromRichTextField } from 'search/EntitySelector/Config';

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
 * @param {WidgetAPI} widgetAPI
 * @param {slate.Editor} editor
 * @param {function} logAction
 */
export async function selectEntityAndInsert(nodeType, widgetAPI, editor, logAction) {
  logAction('openCreateEmbedDialog', { nodeType });

  const baseConfig = await newConfigFromRichTextField(widgetAPI.field, nodeType);
  const config = { ...baseConfig, max: 1, withCreate: true };
  try {
    // widgetAPI.dialogs.selectSingleEntry() or selectSingleAsset()
    const [entity] = await widgetAPI.dialogs.selectEntities(config);
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
        linkType: entity.sys.type
      }
    }
  }
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
