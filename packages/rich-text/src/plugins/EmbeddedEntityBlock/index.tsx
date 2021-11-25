import { KeyboardEvent } from 'react';
import { BLOCKS } from '@contentful/rich-text-types';
import {
  getRenderElement,
  getPlatePluginTypes,
  PlatePlugin,
  getPlatePluginOptions,
  PlateEditor,
} from '@udecode/plate';
import { Transforms } from 'slate';
import { getNodeEntryFromSelection } from '../../helpers/editor';
import { CustomSlatePluginOptions } from 'types';
import { LinkedEntityBlock } from './LinkedEntityBlock';
import { selectEntityAndInsert } from './Util';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import noop from 'lodash/noop';

export { EmbeddedEntityBlockToolbarIcon as ToolbarIcon } from './ToolbarIcon';

const createEmbeddedEntityPlugin =
  (nodeType: BLOCKS.EMBEDDED_ENTRY | BLOCKS.EMBEDDED_ASSET) =>
  (sdk: FieldExtensionSDK): PlatePlugin => ({
    renderElement: getRenderElement(nodeType),
    pluginKeys: nodeType,
    onKeyDown: getWithEmbeddedEntityEvents(nodeType, sdk),
    voidTypes: getPlatePluginTypes(nodeType),
    deserialize: (editor) => {
      const options = getPlatePluginOptions(editor, nodeType);
      const entityTypes = {
        [BLOCKS.EMBEDDED_ENTRY]: 'Entry',
        [BLOCKS.EMBEDDED_ASSET]: 'Asset',
      };

      return {
        element: [
          {
            type: nodeType,
            deserialize: (element) => {
              const entityType = element.getAttribute('data-entity-type');
              const embeddedEntityId = element.getAttribute('data-entity-id');
              const isBlock = entityType === entityTypes[nodeType];

              if (!isBlock) return;

              return {
                type: nodeType,
                isVoid: true,
                data: {
                  target: {
                    sys: {
                      id: embeddedEntityId,
                      linkType: entityType,
                      type: 'Link',
                    },
                  },
                },
              };
            },
            ...options.deserialize,
          },
        ],
      };
    },
  });

export const createEmbeddedEntryBlockPlugin = createEmbeddedEntityPlugin(BLOCKS.EMBEDDED_ENTRY);
export const createEmbeddedAssetBlockPlugin = createEmbeddedEntityPlugin(BLOCKS.EMBEDDED_ASSET);

export const withEmbeddedEntryBlockOptions: CustomSlatePluginOptions = {
  [BLOCKS.EMBEDDED_ENTRY]: {
    type: BLOCKS.EMBEDDED_ENTRY,
    component: LinkedEntityBlock,
  },
};
export const withEmbeddedAssetBlockOptions: CustomSlatePluginOptions = {
  [BLOCKS.EMBEDDED_ASSET]: {
    type: BLOCKS.EMBEDDED_ASSET,
    component: LinkedEntityBlock,
  },
};

type A = 65;
type E = 69;
type AEvent = KeyboardEvent & { keyCode: A };
type EEvent = KeyboardEvent & { keyCode: E };
type ShiftEvent = KeyboardEvent & { shiftKey: true };
type CtrlEvent = KeyboardEvent & { ctrlKey: true };
type MetaEvent = KeyboardEvent & { metaKey: true };
type ModEvent = CtrlEvent | MetaEvent;
type EmbeddedAssetEvent = ModEvent & ShiftEvent & AEvent;
type EmbeddedEntryEvent = ModEvent & ShiftEvent & EEvent;

const isA = (event: KeyboardEvent): event is AEvent => event.keyCode === 65;
const isE = (event: KeyboardEvent): event is EEvent => event.keyCode === 69;
const isMod = (event: KeyboardEvent): event is ModEvent => event.ctrlKey || event.metaKey;
const isShift = (event: KeyboardEvent): event is ShiftEvent => event.shiftKey;
const wasEmbeddedAssetEventTriggered = (event: KeyboardEvent): event is EmbeddedAssetEvent =>
  isMod(event) && isShift(event) && isA(event);
const wasEmbeddedEntryEventTriggered = (event: KeyboardEvent): event is EmbeddedEntryEvent =>
  isMod(event) && isShift(event) && isE(event);

export function getWithEmbeddedEntityEvents(
  nodeType: BLOCKS.EMBEDDED_ENTRY | BLOCKS.EMBEDDED_ASSET,
  sdk: FieldExtensionSDK
) {
  return function withEmbeddedEntityEvents(editor: PlateEditor) {
    // TODO: Dry up copied code from HR
    return function handleEvent(event: KeyboardEvent) {
      if (!editor) return;

      const [, pathToSelectedElement] = getNodeEntryFromSelection(editor, nodeType);

      if (pathToSelectedElement) {
        const isDelete = event.key === 'Delete';
        const isBackspace = event.key === 'Backspace';

        if (isDelete || isBackspace) {
          event.preventDefault();
          Transforms.removeNodes(editor, { at: pathToSelectedElement });
        }
      } else if (
        (nodeType === BLOCKS.EMBEDDED_ENTRY && wasEmbeddedEntryEventTriggered(event)) ||
        (nodeType === BLOCKS.EMBEDDED_ASSET && wasEmbeddedAssetEventTriggered(event))
      ) {
        selectEntityAndInsert(nodeType, sdk, editor, noop);
      }
    };
  };
}
