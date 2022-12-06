import { FieldExtensionSDK } from '@contentful/app-sdk';
import { BLOCKS } from '@contentful/rich-text-types';
import { KeyboardHandler, HotkeyPlugin } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { Transforms } from 'slate';

import { getNodeEntryFromSelection } from '../../helpers/editor';
import { RichTextPlugin, CustomElement, RichTextEditor } from '../../types';
import { withLinkTracking } from '../links-tracking';
import { LinkedEntityBlock } from './LinkedEntityBlock';
import { selectEntityAndInsert } from './Util';

export { EmbeddedEntityBlockToolbarIcon as ToolbarIcon } from './ToolbarIcon';

const entityTypes = {
  [BLOCKS.EMBEDDED_ENTRY]: 'Entry',
  [BLOCKS.EMBEDDED_ASSET]: 'Asset',
};

function getWithEmbeddedEntityEvents(
  nodeType: BLOCKS.EMBEDDED_ENTRY | BLOCKS.EMBEDDED_ASSET,
  sdk: FieldExtensionSDK
  // eslint-disable-next-line -- TODO: check this
  // @ts-ignore
): KeyboardHandler<RichTextEditor, HotkeyPlugin> {
  return (editor, { options: { hotkey } }) =>
    (event) => {
      // eslint-disable-next-line -- TODO: check this
      // @ts-ignore
      const [, pathToSelectedElement] = getNodeEntryFromSelection(editor, nodeType);

      if (pathToSelectedElement) {
        const isDelete = event.key === 'Delete';
        const isBackspace = event.key === 'Backspace';

        if (isDelete || isBackspace) {
          event.preventDefault();
          // eslint-disable-next-line -- TODO: check this
          // @ts-ignore
          Transforms.removeNodes(editor, { at: pathToSelectedElement });
        }

        return;
      }

      // eslint-disable-next-line -- TODO: check this
      // @ts-ignore
      if (hotkey && isHotkey(hotkey, event)) {
        // eslint-disable-next-line -- TODO: check this
        // @ts-ignore
        selectEntityAndInsert(nodeType, sdk, editor, editor.tracking.onShortcutAction);
      }
    };
}

const createEmbeddedEntityPlugin =
  (nodeType: BLOCKS.EMBEDDED_ENTRY | BLOCKS.EMBEDDED_ASSET, hotkey: string) =>
  (sdk: FieldExtensionSDK): RichTextPlugin => ({
    key: nodeType,
    type: nodeType,
    isElement: true,
    isVoid: true,
    component: withLinkTracking(LinkedEntityBlock),
    options: { hotkey },
    handlers: {
      // eslint-disable-next-line -- TODO: check this
      // @ts-ignore
      onKeyDown: getWithEmbeddedEntityEvents(nodeType, sdk),
    },
    deserializeHtml: {
      rules: [
        {
          validAttribute: {
            'data-entity-type': entityTypes[nodeType],
          },
        },
      ],
      withoutChildren: true,
      getNode: (el): CustomElement => ({
        type: nodeType,
        children: [{ text: '' }],
        isVoid: true,
        data: {
          target: {
            sys: {
              id: el.getAttribute('data-entity-id'),
              linkType: el.getAttribute('data-entity-type'),
              type: 'Link',
            },
          },
        },
      }),
    },
  });

export const createEmbeddedEntryBlockPlugin = createEmbeddedEntityPlugin(
  BLOCKS.EMBEDDED_ENTRY,
  'mod+shift+e'
);
export const createEmbeddedAssetBlockPlugin = createEmbeddedEntityPlugin(
  BLOCKS.EMBEDDED_ASSET,
  'mod+shift+a'
);
