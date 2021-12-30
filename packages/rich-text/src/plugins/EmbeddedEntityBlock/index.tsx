import { KeyboardEvent } from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { BLOCKS } from '@contentful/rich-text-types';
import { KeyboardHandler, HotkeyPlugin } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import noop from 'lodash/noop';
import { Transforms } from 'slate';

import { getNodeEntryFromSelection } from '../../helpers/editor';
import { RichTextPlugin, CustomElement } from '../../types';
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
): KeyboardHandler<{}, HotkeyPlugin> {
  return (editor, { options: { hotkey } }) =>
    (event: KeyboardEvent) => {
      const [, pathToSelectedElement] = getNodeEntryFromSelection(editor, nodeType);

      if (pathToSelectedElement) {
        const isDelete = event.key === 'Delete';
        const isBackspace = event.key === 'Backspace';

        if (isDelete || isBackspace) {
          event.preventDefault();
          Transforms.removeNodes(editor, { at: pathToSelectedElement });
        }

        return;
      }

      if (hotkey && isHotkey(hotkey, event)) {
        selectEntityAndInsert(nodeType, sdk, editor, noop);
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
      getNode: (el): CustomElement => ({
        type: nodeType,
        children: [],
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
