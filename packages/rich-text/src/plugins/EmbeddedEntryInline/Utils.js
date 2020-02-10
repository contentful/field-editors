import { INLINES } from '@contentful/rich-text-types';
import { haveAnyInlines, haveEveryInlineOfType, haveInlines } from '../shared/UtilHave';
import newEntitySelectorConfigFromRichTextField from '../../helpers/newEntitySelectorConfigFromRichTextField';

const createInlineNode = id => ({
  type: INLINES.EMBEDDED_ENTRY,
  object: 'inline',
  data: {
    target: {
      sys: {
        id,
        type: 'Link',
        linkType: 'Entry'
      }
    }
  }
});

export const insertInline = (editor, entryId, focusNextLine = true) => {
  if (haveInlines(editor, INLINES.EMBEDDED_ENTRY)) {
    editor.setInlines(createInlineNode(entryId));
  } else {
    editor.insertInline(createInlineNode(entryId));
  }

  focusNextLine ? editor.moveToStartOfNextText().focus() : null;
};

export const hasOnlyInlineEntryInSelection = editor => {
  const inlines = editor.value.inlines;
  const selection = editor.value.selection;
  if (inlines.size === 1 && selection.start.key === selection.end.key) {
    return inlines.get(0).type === INLINES.EMBEDDED_ENTRY;
  }
};

/**
 * Invokes entity selector modal and inserts inline embed.
 * @param {WidgetAPI} widgetAPI
 * @param {slate.Editor} editor
 * @param {function} logAction
 */
export const selectEntryAndInsert = async (widgetAPI, editor, logAction) => {
  logAction('openCreateEmbedDialog', { nodeType });

  const nodeType = INLINES.EMBEDDED_ENTRY;
  const { field, dialogs } = widgetAPI;
  const baseConfig = newEntitySelectorConfigFromRichTextField(field, nodeType);
  const config = { ...baseConfig, withCreate: true };
  try {
    const entry = await dialogs.selectSingleEntry(config);
    if (!entry) {
      return;
    }
    insertInline(editor, entry.sys.id);
    logAction('insert', { nodeType });
  } catch (error) {
    if (error) {
      throw error;
    } else {
      logAction('cancelCreateEmbedDialog', { nodeType });
    }
  }
};

export const canInsertInline = editor => {
  return !haveAnyInlines(editor) || haveEveryInlineOfType(editor, INLINES.EMBEDDED_ENTRY);
};
