import * as React from 'react';

import { FieldExtensionSDK, Link, ContentEntityType as EntityType } from '@contentful/app-sdk';
import { Tooltip, TextLink } from '@contentful/f36-components';
import { LinkIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { INLINES } from '@contentful/rich-text-types';
import { AnyObject, KeyboardHandler, HotkeyPlugin } from '@udecode/plate-core';
import { css } from 'emotion';
import isHotkey from 'is-hotkey';
import { useReadOnly } from 'slate-react';

import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { isLinkActive, unwrapLink } from '../../helpers/editor';
import { transformRemove } from '../../helpers/transformers';
import { useSdkContext } from '../../SdkProvider';
import { useTrackingContext } from '../../TrackingProvider';
import { RichTextPlugin, CustomRenderElementProps, CustomElement } from '../../types';
import { withLinkTracking } from '../links-tracking';
import { ToolbarButton } from '../shared/ToolbarButton';
import { EntryAssetTooltip } from './EntryAssetTooltip';
import { addOrEditLink } from './HyperlinkModal';
import { hasText } from './utils';

const styles = {
  hyperlinkWrapper: css({
    display: 'inline',
    position: 'static',
    a: {
      fontSize: 'inherit !important',
    },
  }),
  hyperlink: css({
    fontSize: 'inherit !important',
    display: 'inline !important',
    '&:hover': {
      fill: tokens.gray900,
    },
    '&:focus': {
      fill: tokens.gray900,
    },
  }),
  hyperlinkIEFallback: css({
    color: '#1683d0',
    textDecoration: 'underline',
  }),
  // TODO: use these styles once we can use the icon
  hyperlinkIcon: css({
    position: 'relative',
    top: '4px',
    height: '14px',
    margin: '0 -2px 0 -1px',
    webkitTransition: 'fill 100ms ease-in-out',
    transition: 'fill 100ms ease-in-out',
    '&:hover': {
      fill: tokens.gray900,
    },
    '&:focus': {
      fill: tokens.gray900,
    },
  }),
};

type HyperlinkElementProps = CustomRenderElementProps<{
  uri?: string;
  target?: Link;
  onEntityFetchComplete?: VoidFunction;
}>;

function UrlHyperlink(props: HyperlinkElementProps) {
  const editor = useContentfulEditor();
  const isReadOnly = useReadOnly();
  const sdk: FieldExtensionSDK = useSdkContext();
  const { uri } = props.element.data;
  const tracking = useTrackingContext();

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!editor) return;
    addOrEditLink(editor, sdk, tracking.onViewportAction);
  }

  return (
    <Tooltip
      content={uri}
      targetWrapperClassName={styles.hyperlinkWrapper}
      placement="bottom"
      maxWidth="auto">
      <TextLink
        as="a"
        href={uri}
        rel="noopener noreferrer"
        onClick={handleClick}
        isDisabled={isReadOnly}
        className={styles.hyperlink}>
        {props.children}
      </TextLink>
    </Tooltip>
  );
}

function EntityHyperlink(props: HyperlinkElementProps) {
  const editor = useContentfulEditor();
  const isReadOnly = useReadOnly();
  const sdk: FieldExtensionSDK = useSdkContext();
  const { target } = props.element.data;
  const { onEntityFetchComplete } = props;
  const tracking = useTrackingContext();

  React.useEffect(() => {
    // The real entity loading happens in the tooltip
    // Since that is deferred the link is considered rendered as soon
    // the component mounts (link text displayed)
    onEntityFetchComplete?.();
  }, [onEntityFetchComplete]);
  if (!target) return null;

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!editor) return;
    addOrEditLink(editor, sdk, tracking.onViewportAction);
  }

  return (
    <Tooltip
      content={
        (
          <EntryAssetTooltip
            id={target.sys.id}
            type={target.sys.linkType as EntityType}
            sdk={sdk}
          />
        ) as unknown as string
      }
      targetWrapperClassName={styles.hyperlinkWrapper}
      placement="bottom"
      maxWidth="auto">
      <TextLink
        as="a"
        onClick={handleClick}
        isDisabled={isReadOnly}
        className={styles.hyperlink}
        data-link-type={target.sys.linkType}
        data-link-id={target.sys.id}>
        {props.children}
      </TextLink>
    </Tooltip>
  );
}

interface ToolbarHyperlinkButtonProps {
  isDisabled: boolean | undefined;
}

export function ToolbarHyperlinkButton(props: ToolbarHyperlinkButtonProps) {
  const editor = useContentfulEditor();
  const isActive = !!(editor && isLinkActive(editor));
  const sdk: FieldExtensionSDK = useSdkContext();
  const tracking = useTrackingContext();

  async function handleClick() {
    if (!editor) return;

    if (isActive) {
      unwrapLink(editor);
      tracking.onToolbarAction('unlinkHyperlinks');
    } else {
      addOrEditLink(editor, sdk, tracking.onToolbarAction);
    }
  }

  if (!editor) return null;

  return (
    <ToolbarButton
      title="Hyperlink"
      testId="hyperlink-toolbar-button"
      onClick={handleClick}
      isActive={isActive}
      isDisabled={props.isDisabled}>
      <LinkIcon />
    </ToolbarButton>
  );
}

const isAnchor = (element: HTMLElement) =>
  element.nodeName === 'A' &&
  !!element.getAttribute('href') &&
  element.getAttribute('href') !== '#';

const isEntryAnchor = (element: HTMLElement) =>
  element.nodeName === 'A' && element.getAttribute('data-link-type') === 'Entry';

const isAssetAnchor = (element: HTMLElement) =>
  element.nodeName === 'A' && element.getAttribute('data-link-type') === 'Asset';

const buildHyperlinkEventHandler =
  (sdk: FieldExtensionSDK): KeyboardHandler<{}, HotkeyPlugin> =>
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
        editor.tracking?.onShortcutAction('unlinkHyperlinks');
      } else {
        addOrEditLink(editor, sdk, editor.tracking?.onShortcutAction);
      }
    };
  };

const getNodeOfType =
  (type: INLINES) =>
  (el: HTMLElement, node: AnyObject): CustomElement<HyperlinkElementProps> => ({
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

export const createHyperlinkPlugin = (sdk: FieldExtensionSDK): RichTextPlugin => {
  const common: Partial<RichTextPlugin> = {
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
