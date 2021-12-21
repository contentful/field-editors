import * as React from 'react';
import { PlatePlugin } from '@udecode/plate-core';
import { useReadOnly } from 'slate-react';
import { INLINES } from '@contentful/rich-text-types';
import { Tooltip, TextLink } from '@contentful/f36-components';
import { EntryAssetTooltip } from './EntryAssetTooltip';
import { LinkIcon } from '@contentful/f36-icons';
import { ToolbarButton } from '../shared/ToolbarButton';
import { css } from 'emotion';
import tokens from '@contentful/f36-tokens';
import { FieldExtensionSDK, Link, ContentEntityType as EntityType } from '@contentful/app-sdk';
import { CustomRenderElementProps, CustomElement } from '../../types';
import { useSdkContext } from '../../SdkProvider';
import { addOrEditLink } from './HyperlinkModal';
import { isLinkActive, unwrapLink } from '../../helpers/editor';
import { useContentfulEditor } from '../../ContentfulEditorProvider';

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

type K = 75;
type KEvent = React.KeyboardEvent & { keyCode: K };
type CtrlEvent = React.KeyboardEvent & { ctrlKey: true };
type MetaEvent = React.KeyboardEvent & { metaKey: true };
type ModEvent = CtrlEvent | MetaEvent;
type HyperlinkEvent = ModEvent & KEvent;

const isMod = (event: React.KeyboardEvent): event is ModEvent => event.ctrlKey || event.metaKey;
const isK = (event: React.KeyboardEvent): event is KEvent => event.keyCode === 75;
const wasHyperlinkEventTriggered = (event: React.KeyboardEvent): event is HyperlinkEvent =>
  isMod(event) && isK(event);

export function buildHyperlinkEventHandler(sdk) {
  return function withHyperlinkEvents(editor) {
    return function handleKeyDown(event: React.KeyboardEvent) {
      if (!editor.selection || !wasHyperlinkEventTriggered(event)) return;
      if (isLinkActive(editor)) {
        unwrapLink(editor);
      } else {
        addOrEditLink(editor, sdk);
      }
    };
  };
}

type HyperlinkElementProps = CustomRenderElementProps<{
  uri?: string;
  target?: Link;
}>;

function UrlHyperlink(props: HyperlinkElementProps) {
  const editor = useContentfulEditor();
  const isReadOnly = useReadOnly();
  const sdk: FieldExtensionSDK = useSdkContext();
  const { uri } = props.element.data;

  async function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!editor) return;
    addOrEditLink(editor, sdk);
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

  if (!target) return null;

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!editor) return;
    addOrEditLink(editor, sdk);
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
        as="button"
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

  async function handleClick() {
    if (!editor) return;

    if (isActive) {
      unwrapLink(editor);
    } else {
      addOrEditLink(editor, sdk);
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
  isAnchor(element) && element.getAttribute('data-link-type') === 'Entry';

const isAssetAnchor = (element: HTMLElement) =>
  isAnchor(element) && element.getAttribute('data-link-type') === 'Asset';

export const createHyperlinkPlugin = (sdk: FieldExtensionSDK): PlatePlugin => {
  const common: Partial<PlatePlugin> = {
    isElement: true,
    isInline: true,
    handlers: {
      onKeyDown: buildHyperlinkEventHandler(sdk),
    },
  };

  const getNodeOfType =
    (type: INLINES) =>
    (el: HTMLElement): CustomElement<HyperlinkElementProps> => ({
      type,
      children: [],
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

  return {
    key: 'hyperlinks',
    plugins: [
      // URL Hyperlink
      {
        ...common,
        key: INLINES.HYPERLINK,
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
      // Asset Hyperlink
      {
        ...common,
        key: INLINES.ASSET_HYPERLINK,
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
  };
};
