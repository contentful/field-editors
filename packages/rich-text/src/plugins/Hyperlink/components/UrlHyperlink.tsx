import * as React from 'react';

import { Link } from '@contentful/app-sdk';
import { TextLink } from '@contentful/f36-components';

import { Element, RenderElementProps } from '../../../internal/types';
import { handleCopyLink, handleEditLink, handleRemoveLink } from './linkHandlers';
import { LinkPopover } from './LinkPopover';
import { styles } from './styles';
import { useHyperlinkCommon } from './useHyperlinkCommon';

type UrlHyperlinkProps = {
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

export function UrlHyperlink(props: UrlHyperlinkProps) {
  const { editor, sdk, isLinkFocused, pathToElement, isEditorFocused } = useHyperlinkCommon(
    props.element
  );
  const uri = props.element.data?.uri;

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
      isEditorFocused={isEditorFocused}
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
