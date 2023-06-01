import { FieldExtensionSDK } from '@contentful/app-sdk';
import { BLOCKS } from '@contentful/rich-text-types';
import { HotkeyPlugin } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';

import { getNodeEntryFromSelection } from '../../helpers/editor';
import { KeyboardHandler, PlatePlugin, removeNodes } from '../../internal';
import { selectEntityAndInsert } from '../shared/EmbeddedBlockUtil';
import { LinkedEntityBlock } from './LinkedEntityBlock';

const entityTypes = {
  [BLOCKS.EMBEDDED_ENTRY]: 'Entry',
  [BLOCKS.EMBEDDED_ASSET]: 'Asset',
};

function getWithEmbeddedEntityEvents(
  nodeType: BLOCKS.EMBEDDED_ENTRY | BLOCKS.EMBEDDED_ASSET,
  sdk: FieldExtensionSDK
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
        selectEntityAndInsert(nodeType, sdk, editor, editor.tracking.onShortcutAction);
      }
    };
}

const createEmbeddedEntityPlugin =
  (nodeType: BLOCKS.EMBEDDED_ENTRY | BLOCKS.EMBEDDED_ASSET, hotkey: string) =>
  (sdk: FieldExtensionSDK): PlatePlugin => ({
    key: nodeType,
    type: nodeType,
    isElement: true,
    isVoid: true,
    component: LinkedEntityBlock,
    options: { hotkey },
    handlers: {
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
      getNode: (el) => ({
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
