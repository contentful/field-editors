import * as React from 'react';

import { FieldAppSDK, Link } from '@contentful/app-sdk';
import { TextLink } from '@contentful/f36-components';

import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { findNodePath, isChildPath } from '../../../internal/queries';
import { Element, RenderElementProps } from '../../../internal/types';
import { useSdkContext } from '../../../SdkProvider';
import { handleCopyLink, handleEditLink, handleRemoveLink } from './linkHandlers';
import { LinkPopover } from './LinkPopover';
import { styles } from './styles';

type HyperlinkElementProps = {
  element: Element & {
    data: {
      uri?: string;
      target: {
        sys: {
          id: string;
          linkType: 'Entry' | 'Asset';
          type: 'Link';
        };
      };
    };
  };
  target?: Link;
  onEntityFetchComplete?: VoidFunction;
  children: Pick<RenderElementProps, 'children'>;
};

export function UrlHyperlink(props: HyperlinkElementProps) {
  const editor = useContentfulEditor();
  const sdk: FieldAppSDK = useSdkContext();
  const focus = editor.selection?.focus;
  const uri = props.element.data?.uri;
  const pathToElement = findNodePath(editor, props.element);
  const isLinkFocused = pathToElement && focus && isChildPath(focus.path, pathToElement);

  const popoverText = (
    <TextLink className={styles.openLink} href={uri} rel="noopener noreferrer" target="_blank">
      {uri}
    </TextLink>
  );

  return (
    <LinkPopover
      isLinkFocused={isLinkFocused}
      handleEditLink={() => handleEditLink(editor, sdk, pathToElement)}
      handleRemoveLink={() => handleRemoveLink(editor)}
      handleCopyLink={() => handleCopyLink(uri)}
      popoverText={popoverText}
    >
      <TextLink
        testId="cf-ui-text-link"
        href={uri}
        onClick={(e) => e.preventDefault()}
        className={styles.hyperlink}
      >
        {props.children}
      </TextLink>
    </LinkPopover>
  );
}
