import * as React from 'react';
import {
  SlatePlugin,
  getRenderElement,
  getSlatePluginTypes,
  useStoreEditor,
  getSlatePluginOptions,
} from '@udecode/slate-plugins-core';
import { INLINES } from '@contentful/rich-text-types';
import { RenderElementProps } from 'slate-react';
import { Element } from 'slate';
import { Tooltip, TextLink, EditorToolbarButton } from '@contentful/forma-36-react-components';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { Link, EntityType, FieldExtensionSDK } from '@contentful/field-editor-reference/dist/types';
import { CustomSlatePluginOptions } from '../../types';
import { EntryAssetTooltip } from './EntryAssetTooltip';
import { useSdkContext } from '../../SdkProvider';
import { addOrEditLink } from './HyperlinkModal';
import { isLinkActive, LINK_TYPES, unwrapLink } from '../../helpers/editor';

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

export function createHyperlinkPlugin(sdk: FieldExtensionSDK): SlatePlugin {
  return {
    renderElement: getRenderElement(LINK_TYPES),
    pluginKeys: LINK_TYPES,
    inlineTypes: getSlatePluginTypes(LINK_TYPES),
    onKeyDown: buildHyperlinkEventHandler(sdk),
    deserialize: (editor) => {
      const hyperlinkOptions = getSlatePluginOptions(editor, INLINES.HYPERLINK);
      const entryHyperlinkOptions = getSlatePluginOptions(editor, INLINES.ENTRY_HYPERLINK);
      const assetHyperlinkOptions = getSlatePluginOptions(editor, INLINES.ASSET_HYPERLINK);

      const isAnchor = (element) =>
        element.nodeName === 'A' &&
        !!element.getAttribute('href') &&
        element.getAttribute('href') !== '#';
      const isEntryAnchor = (element) =>
        isAnchor(element) && element.getAttribute('data-link-type') === 'Entry';
      const isAssetAnchor = (element) =>
        isAnchor(element) && element.getAttribute('data-link-type') === 'Asset';

      return {
        element: [
          {
            type: INLINES.HYPERLINK,
            deserialize: (element) => {
              if (!isAnchor(element) || isEntryAnchor(element) || isAssetAnchor(element)) return;

              return {
                type: INLINES.HYPERLINK,
                data: {
                  uri: element.getAttribute('href'),
                },
              };
            },
            ...hyperlinkOptions.deserialize,
          },
          {
            type: INLINES.ENTRY_HYPERLINK,
            deserialize: (element) => {
              if (!isEntryAnchor(element)) return;

              return {
                type: INLINES.ENTRY_HYPERLINK,
                data: {
                  target: {
                    sys: {
                      id: element.getAttribute('data-link-id'),
                      linkType: element.getAttribute('data-link-type'),
                      link: 'Link',
                    },
                  },
                },
              };
            },
            ...entryHyperlinkOptions.deserialize,
          },
          {
            type: INLINES.ASSET_HYPERLINK,
            deserialize: (element) => {
              if (!isAssetAnchor(element)) return;

              return {
                type: INLINES.ASSET_HYPERLINK,
                data: {
                  target: {
                    sys: {
                      id: element.getAttribute('data-link-id'),
                      linkType: element.getAttribute('data-link-type'),
                      link: 'Link',
                    },
                  },
                },
              };
            },
            ...assetHyperlinkOptions.deserialize,
          },
        ],
      };
    },
  };
}

type K = 75;
type KEvent = KeyboardEvent & { keyCode: K };
type CtrlEvent = KeyboardEvent & { ctrlKey: true };
type MetaEvent = KeyboardEvent & { metaKey: true };
type ModEvent = CtrlEvent | MetaEvent;
type HyperlinkEvent = ModEvent & KEvent;

const isMod = (event: KeyboardEvent): event is ModEvent => event.ctrlKey || event.metaKey;
const isK = (event: KeyboardEvent): event is KEvent => event.keyCode === 75;
const wasHyperlinkEventTriggered = (event: KeyboardEvent): event is HyperlinkEvent =>
  isMod(event) && isK(event);

export function buildHyperlinkEventHandler(sdk) {
  return function withHyperlinkEvents(editor) {
    return function handleKeyDown(event: KeyboardEvent) {
      if (!editor.selection || !wasHyperlinkEventTriggered(event)) return;
      if (isLinkActive(editor)) {
        unwrapLink(editor);
      } else {
        addOrEditLink(editor, sdk);
      }
    };
  };
}

interface HyperlinkElementProps extends RenderElementProps {
  element: Element & {
    data: {
      uri?: string;
      target?: Link;
    };
    type: string;
    isVoid: boolean;
  };
}

function UrlHyperlink(props: HyperlinkElementProps) {
  const editor = useStoreEditor();
  const sdk: FieldExtensionSDK = useSdkContext();
  const { uri } = props.element.data;

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!editor) return;
    addOrEditLink(editor, sdk);
  }

  return (
    <Tooltip
      content={uri}
      targetWrapperClassName={styles.hyperlinkWrapper}
      place="bottom"
      maxWidth="auto">
      <TextLink
        href={uri}
        rel="noopener noreferrer"
        onClick={handleClick}
        className={styles.hyperlink}>
        {props.children}
      </TextLink>
    </Tooltip>
  );
}

function EntityHyperlink(props: HyperlinkElementProps) {
  const editor = useStoreEditor();
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
        <EntryAssetTooltip id={target.sys.id} type={target.sys.linkType as EntityType} sdk={sdk} />
      }
      targetWrapperClassName={styles.hyperlinkWrapper}
      place="bottom"
      maxWidth="auto">
      <TextLink
        href="javascript:void(0)"
        rel="noopener noreferrer"
        onClick={handleClick}
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
  const editor = useStoreEditor();
  const isActive = !!(editor && isLinkActive(editor));
  const sdk: FieldExtensionSDK = useSdkContext();

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!editor) return;

    if (isActive) {
      unwrapLink(editor);
    } else {
      addOrEditLink(editor, sdk);
    }
  }

  if (!editor) return null;

  return (
    <EditorToolbarButton
      icon="Link"
      tooltip="Hyperlink"
      tooltipPlace="bottom"
      label="Hyperlink"
      testId="hyperlink-toolbar-button"
      onClick={handleClick}
      isActive={isActive}
      disabled={props.isDisabled}
    />
  );
}

export const withHyperlinkOptions: CustomSlatePluginOptions = {
  [INLINES.HYPERLINK]: {
    type: INLINES.HYPERLINK,
    component: UrlHyperlink,
  },
  [INLINES.ENTRY_HYPERLINK]: {
    type: INLINES.ENTRY_HYPERLINK,
    component: EntityHyperlink,
  },
  [INLINES.ASSET_HYPERLINK]: {
    type: INLINES.ASSET_HYPERLINK,
    component: EntityHyperlink,
  },
};
