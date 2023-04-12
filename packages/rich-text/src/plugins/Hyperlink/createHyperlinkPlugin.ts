import * as React from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { INLINES } from '@contentful/rich-text-types';
// TODO move this to internal?
import { AnyObject, HotkeyPlugin } from '@udecode/plate-common';
import isHotkey from 'is-hotkey';

import { isLinkActive, unwrapLink } from '../../helpers/editor';
import { transformRemove } from '../../helpers/transformers';
import { PlatePlugin, KeyboardHandler } from '../../internal/types';
import { withLinkTracking } from '../links-tracking';
import { EntityHyperlink } from './components/EntityHyperlink';
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

const buildHyperlinkEventHandler =
  (sdk: FieldExtensionSDK): KeyboardHandler<HotkeyPlugin> =>
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

export const createHyperlinkPlugin = (sdk: FieldExtensionSDK): PlatePlugin => {
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
        component: withLinkTracking(EntityHyperlink),
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
      // Asset Hyperlink
      {
        ...common,
        key: INLINES.ASSET_HYPERLINK,
        type: INLINES.ASSET_HYPERLINK,
        component: withLinkTracking(EntityHyperlink),
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
          type: [INLINES.HYPERLINK, INLINES.ASSET_HYPERLINK, INLINES.ENTRY_HYPERLINK],
        },
        validNode: hasText,
        transform: transformRemove,
      },
    ],
  };
};
