import { KeyboardEvent } from 'react';
import { BLOCKS } from '@contentful/rich-text-types';
import { PlatePlugin, PlateEditor } from '@udecode/plate-core';
import { Transforms } from 'slate';
import { getNodeEntryFromSelection } from '../../helpers/editor';
import { CustomElement } from '../../types';
import { LinkedEntityBlock } from './LinkedEntityBlock';
import { selectEntityAndInsert } from './Util';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import noop from 'lodash/noop';

export { EmbeddedEntityBlockToolbarIcon as ToolbarIcon } from './ToolbarIcon';

const entityTypes = {
  [BLOCKS.EMBEDDED_ENTRY]: 'Entry',
  [BLOCKS.EMBEDDED_ASSET]: 'Asset',
};

const createEmbeddedEntityPlugin =
  (nodeType: BLOCKS.EMBEDDED_ENTRY | BLOCKS.EMBEDDED_ASSET) =>
  (sdk: FieldExtensionSDK): PlatePlugin => ({
    key: nodeType,
    isElement: true,
    isVoid: true,
    component: LinkedEntityBlock,
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

export const createEmbeddedEntryBlockPlugin = createEmbeddedEntityPlugin(BLOCKS.EMBEDDED_ENTRY);
export const createEmbeddedAssetBlockPlugin = createEmbeddedEntityPlugin(BLOCKS.EMBEDDED_ASSET);

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
