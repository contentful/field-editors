import { FieldExtensionSDK } from '@contentful/app-sdk';
import { BLOCKS } from '@contentful/rich-text-types';
import { HotkeyPlugin } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';

import { getNodeEntryFromSelection } from '../../helpers/editor';
import { removeNodes } from '../../internal/transforms';
import { KeyboardHandler, PlatePlugin } from '../../internal/types';
import { selectResourceEntityAndInsert } from '../shared/EmbeddedBlockUtil';
import { LinkedResourceBlock } from './LinkedResourceBlock';

export { EmbeddedResourceBlockToolbarIcon as ToolbarIcon } from './ToolbarIcon';

function getWithEmbeddedResourceEvents(
  nodeType: BLOCKS.EMBEDDED_RESOURCE,
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
        selectResourceEntityAndInsert(sdk, editor, editor.tracking.onShortcutAction);
      }
    };
}

const createEmbeddedResourcePlugin =
  (nodeType: BLOCKS.EMBEDDED_RESOURCE, hotkey: string) =>
  (sdk: FieldExtensionSDK): PlatePlugin => ({
    key: nodeType,
    type: nodeType,
    isElement: true,
    isVoid: true,
    component: LinkedResourceBlock,
    options: { hotkey },
    handlers: {
      onKeyDown: getWithEmbeddedResourceEvents(nodeType, sdk),
    },
    deserializeHtml: {
      rules: [
        {
          validAttribute: {
            'data-entity-type': 'Contentful:Entry',
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
              urn: el.getAttribute('data-entity-id'),
              linkType: el.getAttribute('data-entity-type'),
              type: 'ResourceLink',
            },
          },
        },
      }),
    },
  });

export const createEmbeddedResourceBlockPlugin = createEmbeddedResourcePlugin(
  BLOCKS.EMBEDDED_RESOURCE,
  'mod+shift+r'
);
