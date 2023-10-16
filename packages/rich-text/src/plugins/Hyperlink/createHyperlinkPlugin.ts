import * as React from 'react';

import { FieldAppSDK } from '@contentful/app-sdk';
import { INLINES } from '@contentful/rich-text-types';
import { AnyObject, HotkeyPlugin } from '@udecode/plate-common';
import isHotkey from 'is-hotkey';

import { isLinkActive, unwrapLink } from '../../helpers/editor';
import { transformRemove } from '../../helpers/transformers';
import { KeyboardHandler, PlatePlugin } from '../../internal/types';
import { EntityHyperlink } from './components/EntityHyperlink';
import { ResourceHyperlink } from './components/ResourceHyperlink';
import { UrlHyperlink } from './components/UrlHyperlink';
import { addOrEditLink } from './HyperlinkModal';
import { hasText } from './utils';

const isAnchor = (element: HTMLElement) =>
  element.nodeName === 'A' &&
  !!element.getAttribute('href') &&
  element.getAttribute('href') !== '#';

const isEntryAnchor = (element: HTMLElement) =>
  element.nodeName === 'A' && element.getAttribute('data-link-type') === 'Entry';

const isAssetAnchor = (element: HTMLElement) =>
  element.nodeName === 'A' && element.getAttribute('data-link-type') === 'Asset';

const isResourceAnchor = (element: HTMLElement) =>
  element.nodeName === 'A' &&
  element.getAttribute('data-resource-link-type') === 'Contentful:Entry';

const buildHyperlinkEventHandler =
  (sdk: FieldAppSDK): KeyboardHandler<HotkeyPlugin> =>
  (editor, { options: { hotkey } }) => {
    return (event: React.KeyboardEvent) => {
      if (!editor.selection) {
        return;
      }

      if (hotkey && !isHotkey(hotkey, event)) {
        return;
      }

      if (isLinkActive(editor)) {
        unwrapLink(editor);
        editor.tracking.onShortcutAction('unlinkHyperlinks');
      } else {
        addOrEditLink(editor, sdk, editor.tracking.onShortcutAction);
      }
    };
  };

const getNodeOfType = (type: INLINES) => (el: HTMLElement, node: AnyObject) => ({
  type,
  children: node.children,
  data:
    type === INLINES.HYPERLINK
      ? {
          uri: el.getAttribute('href'),
        }
      : type === INLINES.RESOURCE_HYPERLINK
      ? {
          target: {
            sys: {
              urn: el.getAttribute('data-resource-link-urn'),
              linkType: el.getAttribute('data-resource-link-type'),
              type: 'ResourceLink',
            },
          },
        }
      : {
          target: {
            sys: {
              id: el.getAttribute('data-link-id'),
              linkType: el.getAttribute('data-link-type'),
              type: 'Link',
            },
          },
        },
});

export const createHyperlinkPlugin = (sdk: FieldAppSDK): PlatePlugin => {
  const common: Partial<PlatePlugin> = {
    isElement: true,
    isInline: true,
  };

  return {
    key: 'HyperlinkPlugin',
    options: {
      hotkey: 'mod+k',
    },
    handlers: {
      onKeyDown: buildHyperlinkEventHandler(sdk),
    },
    plugins: [
      // URL Hyperlink
      {
        ...common,
        key: INLINES.HYPERLINK,
        type: INLINES.HYPERLINK,
        component: UrlHyperlink,
        deserializeHtml: {
          rules: [
            {
              validNodeName: ['A'],
            },
          ],
          query: (el) => isAnchor(el) && !(isEntryAnchor(el) || isAssetAnchor(el)),
          getNode: getNodeOfType(INLINES.HYPERLINK),
        },
      },
      // Entry Hyperlink
      {
        ...common,
        key: INLINES.ENTRY_HYPERLINK,
        type: INLINES.ENTRY_HYPERLINK,
        component: EntityHyperlink,
        deserializeHtml: {
          rules: [
            {
              validNodeName: ['A'],
            },
          ],
          query: (el) => isEntryAnchor(el),
          getNode: getNodeOfType(INLINES.ENTRY_HYPERLINK),
        },
      },
      // Resource Hyperlink
      {
        ...common,
        key: INLINES.RESOURCE_HYPERLINK,
        type: INLINES.RESOURCE_HYPERLINK,
        component: ResourceHyperlink,
        deserializeHtml: {
          rules: [
            {
              validNodeName: ['A'],
            },
          ],
          query: (el) => isResourceAnchor(el),
          getNode: getNodeOfType(INLINES.RESOURCE_HYPERLINK),
        },
      },
      // Asset Hyperlink
      {
        ...common,
        key: INLINES.ASSET_HYPERLINK,
        type: INLINES.ASSET_HYPERLINK,
        component: EntityHyperlink,
        deserializeHtml: {
          rules: [
            {
              validNodeName: ['A'],
            },
          ],
          query: (el) => isAssetAnchor(el),
          getNode: getNodeOfType(INLINES.ASSET_HYPERLINK),
        },
      },
    ],
    normalizer: [
      {
        match: {
          type: [
            INLINES.HYPERLINK,
            INLINES.ASSET_HYPERLINK,
            INLINES.ENTRY_HYPERLINK,
            INLINES.RESOURCE_HYPERLINK,
          ],
        },
        validNode: hasText,
        transform: transformRemove,
      },
    ],
  };
};
