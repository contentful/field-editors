import * as React from 'react';
import {
  SlatePlugin,
  getRenderElement,
  getSlatePluginTypes,
  useStoreEditor,
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
import { isLinkActive } from '../../helpers/editor';

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
      fill: tokens.colorTextDark,
    },
    '&:focus': {
      fill: tokens.colorTextDark,
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
      fill: tokens.colorTextDark,
    },
    '&:focus': {
      fill: tokens.colorTextDark,
    },
  }),
};

export function createHyperlinkPlugin(): SlatePlugin {
  const keys: string[] = [INLINES.HYPERLINK, INLINES.ENTRY_HYPERLINK, INLINES.ASSET_HYPERLINK];

  return {
    renderElement: getRenderElement(keys),
    pluginKeys: keys,
    inlineTypes: getSlatePluginTypes(keys),
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
  const { uri } = props.element.data;

  return (
    <Tooltip
      content={uri}
      targetWrapperClassName={styles.hyperlinkWrapper}
      place="bottom"
      maxWidth="auto">
      <TextLink href={uri} rel="noopener noreferrer" className={styles.hyperlink}>
        {props.children}
      </TextLink>
    </Tooltip>
  );
}

function EntryAssetHyperlink(props: HyperlinkElementProps) {
  const { target } = props.element.data;
  const sdk: FieldExtensionSDK = useSdkContext();

  if (!target) return null;

  return (
    <Tooltip
      content={
        <EntryAssetTooltip id={target.sys.id} type={target.sys.linkType as EntityType} sdk={sdk} />
      }
      targetWrapperClassName={styles.hyperlinkWrapper}
      place="bottom"
      maxWidth="auto">
      <TextLink href="javascript:void(0)" rel="noopener noreferrer" className={styles.hyperlink}>
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

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    if (!editor) return;

    addOrEditLink(editor, { linkType: INLINES.HYPERLINK });
  }

  if (!editor) return null;

  return (
    <EditorToolbarButton
      icon="Link"
      tooltip="Hyperlink"
      label="Hyperlink"
      testId="hyperlink-toolbar-button"
      onClick={handleClick}
      isActive={isLinkActive(editor)}
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
    component: EntryAssetHyperlink,
  },
  [INLINES.ASSET_HYPERLINK]: {
    type: INLINES.ASSET_HYPERLINK,
    component: EntryAssetHyperlink,
  },
};
