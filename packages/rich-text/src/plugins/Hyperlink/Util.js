import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { haveInlines } from '../shared/UtilHave';

const { HYPERLINK, ENTRY_HYPERLINK, ASSET_HYPERLINK } = INLINES;
const HYPERLINK_TYPES = [HYPERLINK, ENTRY_HYPERLINK, ASSET_HYPERLINK];

/**
 * Returns whether or not the current value selection would allow for a user
 * edit on a hyperlink.
 *
 * @param {slate.Value} value
 * @returns {boolean}
 */
export function mayEditLink(value) {
  return !value.isExpanded && hasHyperlink(value);
}

/**
 * Returns whether the given value has any hyperlink node.
 *
 * @param {slate.Value} value
 * @returns {boolean}
 */
export function hasHyperlink(value) {
  return HYPERLINK_TYPES.some(type => haveInlines({ value }, type));
}

/**
 * Returns whether the given value has any inline node other than hyperlinks.
 *
 * @param {slate.Value} value
 * @returns {boolean}
 */
export function hasOnlyHyperlinkInlines(value) {
  return value.inlines.every(inline => HYPERLINK_TYPES.includes(inline.type));
}

/**
 * Allows the user to insert/remove a link depending on whether the current
 * selection has a link or not. If there is no link, a dialog is shown for
 * the user.
 *
 * @param {slate.Editor} editor Will be mutated with the required operations.
 * @param {function} createHyperlinkDialog
 * @param {function} logAction
 * @returns {Promise<void>}
 */
export async function toggleLink(editor, createHyperlinkDialog, logAction) {
  if (hasHyperlink(editor.value)) {
    removeLinks(editor, logAction);
  } else {
    await insertLink(editor, createHyperlinkDialog, logAction);
  }
}

async function insertLink(change, createHyperlinkDialog, logAction) {
  logAction('openCreateHyperlinkDialog');
  const showTextInput = !change.value.isExpanded || change.value.fragment.text.trim() === '';
  try {
    const { text, type: linkType, uri, target } = await createHyperlinkDialog({
      showTextInput,
      value: { text: change.value.fragment.text || '' }
    });
    if (showTextInput) {
      if (change.isVoid(change.value.blocks.last())) {
        change.insertBlock(BLOCKS.PARAGRAPH);
      }
      change.insertText(text).moveFocusForward(0 - text.length);
    }
    const data = target ? { target } : { uri };
    change.call(wrapLink, linkType, data);
    const nodeType = linkTypeToNodeType(linkType);
    logAction('insert', { nodeType, linkType });
  } catch (e) {
    if (e) throw e;
    logAction('cancelCreateHyperlinkDialog');
  }
  change.focus();
}

function removeLinks(change, logAction) {
  HYPERLINK_TYPES.forEach(type => change.unwrapInline(type));
  change.focus();
  logAction('unlinkHyperlinks');
}

/**
 * Allows the user to edit the first selected link of a given Change by showing
 * a dialog and applying the change.
 *
 * @param {slate.Editor} change Will be mutated with the required operations.
 * @param {function} createHyperlinkDialog
 * @param {function} logAction
 * @returns {Promise<void>}
 */
export async function editLink(change, createHyperlinkDialog, logAction) {
  const link = change.value.inlines.get(0);
  if (!link) {
    throw new Error('Change object contains no link to be edited.');
  }
  logAction('openEditHyperlinkDialog');
  const { uri: oldUri, target: oldTarget } = link.data.toJSON();
  try {
    const { type: linkType, uri, target } = await createHyperlinkDialog({
      showTextInput: false,
      value: oldTarget ? { target: oldTarget } : { uri: oldUri }
    });
    const nodeType = linkTypeToNodeType(linkType);
    const data = target ? { target } : { uri };
    change.setInlines({ type: nodeType, data });
    logAction('edit', { nodeType, linkType });
  } catch (e) {
    if (e) throw e;
    logAction('cancelEditHyperlinkDialog');
  }
  change.focus();
}

function wrapLink(change, linkType, data) {
  change.wrapInline({
    type: linkTypeToNodeType(linkType),
    data
  });
  change.moveToEnd();
}

function linkTypeToNodeType(linkType) {
  switch (linkType) {
    case 'Entry':
      return ENTRY_HYPERLINK;
    case 'Asset':
      return ASSET_HYPERLINK;
  }
  return HYPERLINK;
}
